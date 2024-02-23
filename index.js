import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import authRoute from './routes/auth.js';
import supplierRoute from './routes/supplier.js';
import customerRoute from './routes/customer.js';
import productRoute from './routes/product.js';
import adminRoute from './routes/admin.js';

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});
const corsOption = {
  origin: true,
};

// connect to mongodb server
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL_DEV);
    console.log("Mongoose connection successfully established");
  } catch (error) {
    console.log('Mongoose connection error: ' + error);
  }
};

app.use(cors(corsOption));
app.use(express.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/supplier", supplierRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/product", productRoute);  // Include productRoute
app.use("/api/v1/admin", adminRoute);

app.get('/', async (req, res) => {
  res.send("<center><h1>Welcome to BlackHorse Company</h1></center>");
});

app.listen(port, () => {
  connectDB();
  console.log(`listening on http://localhost:${port}`);
});
