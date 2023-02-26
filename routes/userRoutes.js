import express from 'express';

import { isAuthenticated } from '../middlewares/auth.js';
import {
  login,
  signup,
  getMyProfile,
  logOut,
  updateProfile,
  changePassword,
  updatePic,
  forgetPassword,
  resetPassword,
} from '../controllers/userController.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', singleUpload, signup);
router.get('/me', isAuthenticated, getMyProfile);
router.get('/logout', isAuthenticated, logOut);
router.patch('/updateprofile', isAuthenticated, updateProfile);
router.patch('/changepassword', isAuthenticated, changePassword);
router.patch('/updatepic', isAuthenticated,singleUpload, updatePic);
router.patch('/resetpassword', isAuthenticated,resetPassword);
router.post('/forgetpassword', isAuthenticated,forgetPassword);


export default router;
