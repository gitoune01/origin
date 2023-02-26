import asyncHandler from 'express-async-handler';
import Category from '../models/category.js';
import Product from '../models/product.js';
import ErrorHandler from '../utils/customError.js';

export const addCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.body;
  await Category.create({ category });

  res.status(201).json({
    success: true,
    message: 'Category added successfully',
  });
});
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    categories,
  });
});

////////////////////////////////
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log('ID=>>>>>>>>>>>>>>>>', id);
  const category = await Category.findById(id);
   console.log("CAT=>>>>>>>>>>",category);
  if (!category) return next(new ErrorHandler('Caterory not found', 404));
  const products = await Product.find({ category: category._id });
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }

  await category.remove();
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
