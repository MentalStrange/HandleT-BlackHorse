import express from 'express';
import {
    createProductSupplier, deleteProductSupplier,
    getCompany,
    getOrdersForSupplierInCurrentMonth,
    getSupplier,
    lastOrdersBySupplierId,
    totalSalesBySupplierId,
    updateProductSupplier,
    updateSupplier,
    uploadPhoto,
    uploadPlaceImages,
    deletePlaceImages,
} from '../controllers/supplierController.js';
import { changeImageOffer, createOffer, deleteOffer, getAllOffer, getOffer, getOfferBySupplierId, updateOffer } from '../controllers/offerController.js';
import { getAllOrder, getAllOrderBySupplierId, totalOrderBySupplierId } from '../controllers/orderController.js';
import { createPromoCode } from '../controllers/promoCodeController.js';
import { getAllProduct } from '../controllers/productsController.js';
import { storage } from '../controllers/sharedFunction.js';
import multer from 'multer';

const uploadSupplier = multer({ storage: storage('supplier') });
const uploadPlaceImage = multer({ storage: storage('placeimages') });
const uploadOffer = multer({ storage: storage('offer') });

const Router = express.Router();

Router.patch("/uploadPhoto/:id", uploadSupplier.single("image"), uploadPhoto);
Router.post("/uploadPlaceImage/:id", uploadPlaceImage.array("placeImage"), uploadPlaceImages);
Router.delete("/deletePlaceImage/:id", deletePlaceImages);

Router.get('/company', getCompany);
Router.get('/:id', getSupplier);
Router.patch('/:id', updateSupplier);

Router.get('/offer/all', getAllOffer);
Router.get('/offer/:id', getOffer);
Router.get('/offer/supplier/:id',getOfferBySupplierId)
Router.post('/offer', createOffer);
Router.post('/offer/changeImage/:id', uploadOffer.single("image"), changeImageOffer);
Router.patch('/offer/:id', updateOffer);
Router.delete('/offer/:id', deleteOffer);

Router.get('/product/all',getAllProduct)
// Router.post('/product', createProduct);
Router.post('/createProduct', createProductSupplier);
Router.patch('/product/:id', updateProductSupplier);
Router.delete('/product/:id', deleteProductSupplier);

Router.get('/order/:id', getAllOrderBySupplierId);
Router.get('/totalNumberOfOrder/:id',totalOrderBySupplierId)
Router.get('/order/thisMonth/:id', getOrdersForSupplierInCurrentMonth);
Router.get('/order/last/:id',lastOrdersBySupplierId)
Router.get('/totalSales/:id', totalSalesBySupplierId);

Router.post('/promoCode', createPromoCode);


export default Router;
