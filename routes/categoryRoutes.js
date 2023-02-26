import express from 'express';
import {
  addCategory,
  deleteCategory,
  getAllCategories,
} from '../controllers/categoryController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/new', isAuthenticated, isAdmin,addCategory);
router.get('/all', getAllCategories);
router.delete('/delete/:id', isAuthenticated, isAdmin,deleteCategory);

export default router;""
