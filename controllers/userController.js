import User from '../models/user.js';
import ErrorHandler from '../utils/customError.js';
import asyncHandler from 'express-async-handler';
import cloudinary from 'cloudinary';
import { getDataUri, sendEmail } from '../utils/features.js';

//LOGIN
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new ErrorHandler('Please  make sur to provide all credentials', 400)
    );

  //handle errors

  const user = await User.findOne({ email }).select('+password');
  console.log('USER', user);

  //handle errors
  const isCorrectPassword = await user.comparePassword(password);
  if (!isCorrectPassword || !user)
    return next(new ErrorHandler('Invalid credentials', 400));
  //jwt
  const token = user.genToken();

  //generate cookie token

  res
    .status(200)
    .cookie('token', token, {
      secure: false, //true not working with postman
      // httpOnly: false,
      // sameSite:"none",
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), //15jours
    })
    .json({ success: true, message: `Welcome ${user.name}` });

  // next(new Error('Authentication);
});

//REGISTER

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;

  //already registered ?

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler('Such account already registered', 400));
  }
  let avatar;
  //req.file
  if (req.file) {
    const file = getDataUri(req.file);
    // //add cloudinary here
    try {
      const result = await cloudinary.v2.uploader.upload(file.content);
      if (result) {
        const { public_id, secure_url } = result;
        avatar = {
          public_id,
          url: secure_url,
        };
      }
    } catch (err) {
      console.log('ERROR=>>>>>>>>>>:', err);
      throw new ErrorHandler('Internal Error', 500);
    }
  }

  const user = await User.create({
    //wrapper for const user = new User + user.save()
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
    avatar,
  });

  //generate cookie token
  const token = user.genToken();
  console.log('TOKEN=>>>>', token);
  res
    .status(201)
    .cookie('token', token, {
      secure: false, //true not working with postman
      // httpOnly: false,
      // sameSite:"none",
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), //15jours
    })
    .json({
      success: true,
      message: 'User created successfully',
    });
});

//logout

export const logOut = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie('token', '', {
      secure: false, //true not working with postman
      // httpOnly: false,
      // sameSite:"none",
      expires: new Date(Date.now()), //15jours
    })
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

//update my profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
  });
});

///update password
export const changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler('Please provide both passwords"', 400));

  const isCorrectPassword = await user.comparePassword(oldPassword);
  if (!isCorrectPassword)
    return next(new ErrorHandler('Invalid credentials', 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

//update pictures
export const updatePic = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);
  // //add cloudinary here

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  try {
    const result = await cloudinary.v2.uploader.upload(file.content);
    if (result) {
      const { public_id, secure_url } = result;
      user.avatar = {
        public_id,
        url: secure_url,
      };
      await user.save();
    }
  } catch (err) {
    throw new ErrorHandler('Internal Error', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Avatar updated successfully',
  });
});

/////////////////////////////////////////////////////////////////////////////
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log('USER=>>>>>>>>>', user.email);

  if (!user) return next(new ErrorHandler('Incorret Email', 404));
  //formula to generate random number between max and min
  const numberNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(numberNumber);
  const otp_expire = 15 * 60 * 1000;
  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();
  console.log(otp);

  const message = `Your OTP to reset password  is ${otp}. \n Please ignore if you haven 't requested this.`;

  try {
    await sendEmail('OTP For Resetting Password', user.email, message);
  } catch (err) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(new ErrorHandler(err, 404));
  }

  res.status(200).json({
    success: true,
    message: `Email Sent To ${user.email}`,
  });
});

///////////////////////////////////////////////////////////////////////////////////////
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { otp, password } = req.body;
  if (!otp || !password)
    return next(new ErrorHandler('Please provide all fields', 400));

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });
  if (!user) return next(new ErrorHandler('Invalid credentials', 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password  Changed Successfully, You can log in now',
  });
});
