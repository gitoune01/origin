import asyncHandler from 'express-async-handler';
import ErrorHandler from "../utils/customError.js"

export const isAdmin = asyncHandler(async(req,res, next) => {

    if(req.user.role !== 'admin') return next(new ErrorHandler("Sorry, restricted access area",403))
  next()
})