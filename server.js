import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { catchErrors } from './middlewares/globalerrors.js';
import Stripe from 'stripe';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)



import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = process.env.PORT || 8000;
//middlewares
app.use(cors({
  credentials:true,
  methods:["GET","POST","PUT","DELETE"],
  origin:[process.env.FRONTEND_URI_1,process.env.FRONTEND_URI_2]
}))
app.use(express.json());
app.use(cookieParser());

//api routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/order', orderRoutes);

//global error handler

app.use(catchErrors);

//db connect
const startServer = async () => {
  mongoose.set('strictQuery', true);
  try {
    await mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('connected to DB');
        app.listen(port, () => {
          console.log('Server listening on port ' + port);
        });
      })
      .catch((err) => console.log(err)); //errors at connection
  } catch (err) {
    console.log(err); //errors post-connection
    process.exit(1);
  }
};

startServer();
