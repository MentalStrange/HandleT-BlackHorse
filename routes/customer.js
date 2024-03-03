import express from 'express';
import {
    getAllCategory,
    updateCustomer,
    uploadPhoto,
    getCustomerById
} from '../controllers/customerController.js';
import {  getAllProductAssignedToSupplier, getProductByCategory } from '../controllers/productsController.js';
import {  getAllHomeSlideShow } from '../controllers/adminController.js';
import {createOrder, getAllOrderByCustomerId, getBestSeller, updateOrder} from '../controllers/orderController.js';
import { applyPromoCode } from '../controllers/promoCodeController.js';
import { createRating } from '../controllers/ratingController.js';
import { authenticate } from "../middlewares/authorizationMiddleware.js";
import { getAllSupplier } from '../controllers/supplierController.js';
import { createGroup, getAllGroup, getAllGroupForCustomer, joinGroup } from '../controllers/groupController.js';
import { storage } from '../controllers/sharedFunction.js';
import multer from 'multer';
import { getOfferByOrderId } from '../controllers/offerController.js';

const uploadCustomer = multer({ storage: storage('customer') });

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

Router.patch("/uploadPhoto/:id", uploadCustomer.single("image"), uploadPhoto);

Router.post("/promoCode",applyPromoCode)

Router.get('/supplier',authenticate, getAllSupplier)

Router.get('/group',getAllGroup);
Router.post('/group',createGroup);
Router.patch('/group/:id', joinGroup);

Router.get('/offer/order/:id', getOfferByOrderId)
export default Router;