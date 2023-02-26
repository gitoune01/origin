import asyncHandler from 'express-async-handler';
import Order from '../models/order.js';
import Product from '../models/product.js';
import ErrorHandler from '../utils/customError.js';
import { stripe } from '../server.js';

export const processPayment = asyncHandler(async (req, res, next) => {
  const { totalAmount } = req.body;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: 'eur',
  });

  res.status(200).json({
    success: true,
    client_secret,
  });
});

export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;
  Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  });
  //update stock
  orderItems.forEach(async (item, index) => {
    const product = await Product.findById(orderItems[index].product);
    product.stock -= orderItems[index].quantity;
    await product.save();
  });
  res.status(201).json({
    success: true,
    message: 'Order Placed Successfully',
  });
});

export const myOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});
///////////////////////////////////////////////////

export const allOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find();
  console.log(allOrders);
  next();
  res.status(200).json({
    success: true,
    orders,
  });
});
////////////////////////////////////////////////////
export const singleOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler('No matching order found', 404));
  res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return next(new ErrorHandler('No matching order found', 404));
  if (order.orderStatus === 'Preparing') {
    order.orderStatus = 'Shipped';
  } else if (order.orderStatus === 'Shipped') {
    order.orderStatus = 'Delivered';
    order.deliveredAt = new Date(Date.now());
  } else {
    return next(new ErrorHandler('Order has already been delivered', 400));
  }
  await order.save();
  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
  });
});
