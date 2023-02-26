import express from 'express';
import {
  allOrders,
  createOrder,
  myOrders,
  processPayment,
  singleOrder,
  updateOrder,
} from '../controllers/orderController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
const router = express.Router();

router.post('/payment', isAuthenticated, processPayment)

router.post('/new', isAuthenticated, createOrder);
router.get('/allorders', isAuthenticated,isAdmin,allOrders);
router.get('/myorders', isAuthenticated, myOrders);
router.get('/single/:orderId', isAuthenticated, singleOrder);
router.patch('/update/:orderId', isAuthenticated,isAdmin, updateOrder);
 
export default router;
