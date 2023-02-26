import ErrorHandler from "../utils/customError.js"
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from "../models/user.js"

export const isAuthenticated = asyncHandler(async(req,res, next) => {
  const {token} = req.cookies
  if (!token) return next(new ErrorHandler("No access to this private route",401))

  const {id} = jwt.decode(token,process.env.JWT_SECRET)
  console.log(id)
  const user = await User.findById(id)
  if(!user) return next(new ErrorHandler("Bad credentials",401) ) 
  req.user = user
  next()
})


