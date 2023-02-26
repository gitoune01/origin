import asyncHandler from 'express-async-handler';
import Product from '../models/product.js';
import ErrorHandler from '../utils/customError.js';
import cloudinary from 'cloudinary';
import { getDataUri, sendEmail } from '../utils/features.js';


export const getAllProducts = asyncHandler(async (req, res, next) => {
  //search and category
  const products = await Product.find({}).populate('category');


  const outOfStock = products.filter(product => product.stock === 0)
  res.status(200).json({
    success: true,
    products,
    outOfStock:outOfStock.length,
    inStock: products.length-outOfStock.length
  });
});

export const searchProducts = asyncHandler(async (req, res, next) => {
  //search and category

  const { keyword, category } = req.query;
  console.log("QUERY",req.query);

  const products = await Product.find({
    name: {
      $regex: keyword ? keyword : '', //$regex: begins or ends up or contains expression keyword
      $options: 'i',
    },
    category: category ? category : undefined 
  }).populate('category');
  res.status(200).json({
    success: true,
    products,
  });
});
export const getSingleProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  //search and category
  const product = await Product.findById(id).populate("category");

  if (!product) return next(new ErrorHandler('No matching  product found'));
  res.status(200).json({
    success: true,
    product,
  });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;
  console.log('DATA', req.body);
  if (!req.file) return next(new ErrorHandler('Please provide a picture', 400));
  if (!name || !description || !price || !stock)
    return next(
      new ErrorHandler('Please make sure to fill in all required fields', 400)
    );

  // //add cloudinary here
  const file = getDataUri(req.file);

  try {
    const result = await cloudinary.v2.uploader.upload(file.content);
    if (result) {
      const { public_id, secure_url } = result;
      const image = {
        public_id,
        url: secure_url,
      };

      await Product.create({
        name,
        description,
        category,
        price,
        stock,
        images: [image],
      });
    }
  } catch (err) {
    console.log(err);
    throw new ErrorHandler('Internal Error', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Product was created successfully',
  });
});

///

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const { name, description, category, price, stock } = req.body;
  console.log('REQBODY', req.body);
  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product was updated successfully',
    product,
  });
});

/////////////////////////////////////

export const addProductImage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const file = getDataUri(req.file);
  if (!req.file) return next(new ErrorHandler('Please provide a picture', 400));

  // //add cloudinary here

  try {
    const result = await cloudinary.v2.uploader.upload(file.content);
    if (result) {
      const { public_id, secure_url } = result;
      const image = {
        public_id,
        url: secure_url,
      };
      product.images.push(image);
      await product.save();
    }
  } catch (err) {
    throw new ErrorHandler('Internal Error', 500);
  }

  res.status(200).json({
    success: true,
    message: 'image added successfully',
  });
});

////////////////////////////////////////////////////////////////////////////////
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  const { id } = req.query;
  if (!id) return next(new ErrorHandler('Please Image Id', 400));

  let isExist = -1;

  product.images.forEach((image, index) => {
    if (image._id.toString() === id.toString()) isExist = index;
  });

  console.log(isExist);
  if (isExist < 0) return next(new ErrorHandler('Image Do NOt exist', 404));
  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  product.images.splice(isExist, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'image deleted successfully',
  });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler('Product not found', 404));

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await product.remove();

  res.status(201).json({
    success: true,
    message: 'product deleted successfully',
  });
});
