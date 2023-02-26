import express from 'express';
import { addProductImage, createProduct, deleteProduct, deleteProductImage, getAllProducts, getSingleProduct, searchProducts, updateProduct } from '../controllers/productController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router()



router.get('/all', getAllProducts)
router.post('/search', searchProducts)
router.get('/single/:id',getSingleProduct)
router.post('/new', isAuthenticated,isAdmin, singleUpload, createProduct)
router.patch('/update/:id', isAuthenticated, isAdmin, updateProduct)
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteProduct)
router.post('/images/:id', isAuthenticated,singleUpload,addProductImage)
router.delete('/image/:id/delete',isAuthenticated,isAdmin,deleteProductImage)






export default router


