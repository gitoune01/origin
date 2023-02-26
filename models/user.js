import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: [true, 'Email is already taken'],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  avatar: {
    public_id: String,
    url: String,
  },
  otp: Number,
  otp_expire: Date,
});

userSchema.pre('save', async function () {
  if(!this.isModified('password')) return;  //if updating use profile do not crypt again current password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (incomingPassword) {
  const isMatch = await bcrypt.compare(incomingPassword, this.password);
  return isMatch;
};

userSchema.methods.genToken = function () {
   const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });
  return token;
};

export default mongoose.model('User', userSchema);
