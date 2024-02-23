import express from 'express';
import  { createDeliveryBoy, createUnit, deleteSupplier, deleteUnit, getAllUnits, updateUnit}  from '../controllers/adminController.js';
import { createProduct, deleteProduct } from '../controllers/sharedFunction.js';
import { createCategory } from '../controllers/categoryController.js';
import { createCustomer, createSupplier } from '../auth/signup.js';
import { getAllSupplier, getSupplier, getTotalSales, totalSalesBySupplierId, updateSupplier } from '../controllers/supplierController.js';
import { createOffer, deleteOffer, getAllOffer, getOffer } from '../controllers/offerController.js';
import { getAllOrder, mostFrequentDistricts, updateOrder } from '../controllers/orderController.js';
import { createHomeSlideShow, deleteHomeSlideShow, getAllHomeSlideShow } from '../controllers/homeSlideShowController.js';
import { authenticate } from '../middlewares/authorizationMiddleware.js';
import { getAllProduct } from '../controllers/productsController.js';
// import { authenticate } from '../middlewares/authorizationMiddleware.js';

const Router = express.Router();


Router.get('/supplier',authenticate,getAllSupplier);
Router.get('/supplier/:id', getSupplier);
Router.delete('/supplier/:id',  deleteSupplier);
Router.post('/supplier',  createSupplier );
Router.patch('/supplier/:id',  updateSupplier)

Router.get('/customer',createCustomer);
// Router.delete('/customer/:id',deleteCustomer);
Router.get('/product',getAllProduct)
Router.post('/product',  createProduct);
Router.delete('/product/:id',  deleteProduct);

Router.post('/category',  createCategory);

Router.post('/deliveryBoy',  createDeliveryBoy);

Router.get('/offer',  getAllOffer);
Router.post('/offer',  createOffer);
Router.delete('/offer/:id',  deleteOffer);

Router.post('/homeSlideShow',  createHomeSlideShow);
Router.get('/homeSlideShow',  getAllHomeSlideShow);
Router.delete('/homeSlideShow/:id',  deleteHomeSlideShow);

Router.patch("/order/:id",   updateOrder);
Router.get("/order",  getAllOrder)
Router.get('/order/mostDistrict',  mostFrequentDistricts)

Router.get("/totalSales/:id",  totalSalesBySupplierId)
Router.get("/totalSales",  getTotalSales);

Router.post("/unit",  createUnit);
Router.get("/unit",getAllUnits);
Router.patch("/unit/:id",updateUnit);
Router.delete('/unit/:id',deleteUnit);



export default Router;