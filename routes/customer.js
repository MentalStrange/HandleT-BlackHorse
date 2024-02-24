import express from 'express';
import {
    getAllCategory,
    updateCustomer,
    deletePhoto,
    uploadPhoto,
    getCustomerById
} from '../controllers/customerController.js';
import { getAllProduct, getAllProductAssignedToSupplier, getProductByCategory } from '../controllers/productsController.js';
import {  getAllHomeSlideShow } from '../controllers/adminController.js';
import {createOrder, getAllOrderByCustomerId, getBestSeller, updateOrder} from '../controllers/orderController.js';
import { applyPromoCode } from '../controllers/promoCodeController.js';
import { createRating } from '../controllers/ratingController.js';
import { authenticate } from "../middlewares/authorizationMiddleware.js";
import { getAllSupplier } from '../controllers/supplierController.js';

const Router = express.Router();

Router.get('/category',getAllCategory);
Router.get('/product/category/:id',getProductByCategory);
Router.get('/product',getAllProductAssignedToSupplier);

Router.get('/homeSlideShow',getAllHomeSlideShow);

Router.get('/getCustomerById/:id', authenticate, getCustomerById);
Router.patch("/:id", updateCustomer);

Router.post("/createRating", createRating);  // used by customer&supplier

Router.post("/order", createOrder);
Router.patch("/order/:id", updateOrder);
Router.get('/order/bestSeller',getBestSeller);
Router.get("/order/:id", getAllOrderByCustomerId);

Router.patch ("/uploadPhoto/:id", uploadPhoto);
Router.delete("/deletePhoto/:id", deletePhoto);

Router.post("/promoCode",applyPromoCode)

Router.get('/supplier',authenticate, getAllSupplier)
export default Router;