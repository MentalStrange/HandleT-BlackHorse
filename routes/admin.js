import express from "express";
import multer from "multer";
import {
  createExpireDateGroup,
  createFee,
  createRegion,
  createSubUnit,
  createUnit,
  deleteRegion,
  deleteSubUnit,
  deleteSupplier,
  deleteUnit,
  getAllRegion,
  getAllSubUnits,
  getAllUnits,
  getFee,
  updateSubUnit,
  updateUnit,
} from "../controllers/adminController.js";
import {
  createProduct,
  deleteProduct, getProducts,
  storage,
  updateProduct,
} from "../controllers/sharedFunction.js";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategory,
  changeImageCategory,
} from "../controllers/categoryController.js";
import { createCustomer, createSupplier } from "../auth/signup.js";
import {
  getAllSupplier,
  getSupplier,
  getTotalSales,
  totalSalesBySupplierId,
  updateSupplier,
} from "../controllers/supplierController.js";
import {
  createOffer,
  deleteOffer,
  getAllOffer,
  getOffer,
} from "../controllers/offerController.js";
import {
  getAllOrder,
  getOrderByDelivery,
  mostFrequentDistricts,
  updateOrder,
} from "../controllers/orderController.js";
import {
  createHomeSlideShow,
  deleteHomeSlideShow,
  getAllHomeSlideShow,
} from "../controllers/homeSlideShowController.js";
import { authenticate } from "../middlewares/authorizationMiddleware.js";
import { deleteProductImage, getAllProduct, uploadProductImages } from "../controllers/productsController.js";
import { restrict } from "../middlewares/restrictionMiddleware.js";
import {
  createCar,
  deleteCar, getCarByWeight,
  getCars,
  updateCar,
  changeImageCar,
} from "../controllers/carController.js";
import { createDeliveryBoy, updateDeliveryBoy, changeImageDeliveryBoy , getAllDeliveryBoy } from "../controllers/deliveryBoyController.js";
import validateField from "../middlewares/fieldMiddleware.js";
import { createPromoCode, deletePromoCode, getAllPromoCode, updatePromoCode } from "../controllers/promoCodeController.js";
import { checkAllFieldsFilled } from "../middlewares/isActive.js";
// import { authenticate } from '../middlewares/authorizationMiddleware.js';


const uploadCategory = multer({ storage: storage('category') });
const uploadSlideShow = multer({ storage: storage('slideshow') });
const uploadDeliveryBoy = multer({ storage: storage('deliveryboy') });
const uploadProducts = multer({ storage: storage('product') });
const uploadCar = multer({ storage: storage('car') });

const Router = express.Router();

Router.get("/supplier", authenticate, getAllSupplier);
Router.get("/supplier/:id", getSupplier);
Router.delete("/supplier/:id", deleteSupplier);
Router.post("/supplier", createSupplier);
Router.patch("/supplier/:id", updateSupplier);

Router.get("/customer", createCustomer);
// Router.delete('/customer/:id',deleteCustomer);
Router.get("/product", authenticate, restrict(["blackHorse", "company"]), getAllProduct);
Router.post("/product", uploadProducts.array("images"), createProduct);
Router.patch("/product/uploadImages/:id", uploadProducts.array("images"), uploadProductImages);
Router.delete("/product/deleteImage/:id", deleteProductImage);
Router.get("/products", getProducts);
Router.patch("/product/:id", updateProduct);
Router.delete("/product/:id", deleteProduct);

Router.get("/getAllCategory", getAllCategory);
Router.post("/category", uploadCategory.single("image"), createCategory);
Router.patch("/category/:id", updateCategory);
Router.delete('/category/:id', deleteCategory);
Router.patch("/category/changeImage/:id", uploadCategory.single("image"), changeImageCategory);

Router.get("/deliveryBoys", getAllDeliveryBoy);
Router.post("/deliveryBoy", createDeliveryBoy);
Router.patch("/deliverBoy/:id", updateDeliveryBoy);
Router.patch("/deliverBoy/changeImage/:id", uploadDeliveryBoy.single("image"), changeImageDeliveryBoy);

Router.get("/offer", getAllOffer);
Router.post("/offer", createOffer);
Router.delete("/offer/:id", deleteOffer);

Router.post("/homeSlideShow", uploadSlideShow.single("image"), createHomeSlideShow);
Router.get("/homeSlideShow", getAllHomeSlideShow);
Router.delete("/homeSlideShow/:id", deleteHomeSlideShow);

Router.patch("/order/:id", updateOrder);
Router.get("/getOrderByDelivery/:deliveryId", getOrderByDelivery);

Router.get("/order", getAllOrder);
Router.get("/order/mostDistrict", mostFrequentDistricts);

Router.get("/totalSales/:id", totalSalesBySupplierId);
Router.get("/totalSales", getTotalSales);

Router.post("/unit", createUnit);
Router.get("/unit", getAllUnits);
Router.patch("/unit/:id", updateUnit);
Router.delete("/unit/:id", deleteUnit);

Router.post('/subUnit',createSubUnit);
Router.get('/subUnit',getAllSubUnits);
Router.patch('/subUnit/:id',updateSubUnit);
Router.delete('/subUnit/:id',deleteSubUnit);

Router.get("/fee", getFee);
Router.post("/fee", createFee);

Router.post("/car", uploadCar.single("image"), createCar);
Router.get("/car", getCars);
Router.patch("/car/:id", updateCar);
Router.patch("/car/changeImage/:id", uploadCar.single("image"), changeImageCar);
Router.delete("/car/:id", deleteCar);
Router.post("/getCarByWeight", getCarByWeight);

Router.post('/region',validateField,createRegion)
Router.get('/region', getAllRegion)
Router.delete('/region/:id',deleteRegion)

Router.post('/group/expireDate',createExpireDateGroup)

Router.post('/promoCode',createPromoCode);
Router.get('/promoCode',getAllPromoCode);
Router.delete('/promoCode/:id',deletePromoCode);
Router.patch('/promoCode/:id',updatePromoCode)

export default Router;
