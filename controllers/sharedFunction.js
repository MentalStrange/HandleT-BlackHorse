import { v2 as cloudinary } from 'cloudinary';
import Product from "../models/productSchema.js";
import mongoose, {connect} from "mongoose";
import Customer from "../models/customerSchema.js";
import Rating from "../models/ratingSchema.js";
import Supplier from "../models/supplierSchema.js";
import {transformationOffer, transformationProduct} from "../format/transformationObject.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from 'path';
import SupplierProduct from "../models/supplierProductSchema.js";
import Offer from "../models/offerSchema.js";
import paginateResponse from "../utils/paginationResponse.js";

export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const productsCount = await Product.countDocuments();
  const products = await Product.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  const adminProducts = await Promise.all(products.map(async (product)=>{
        return transformationProduct(product);
      })
  );
  await paginateResponse(res, req.query, adminProducts, productsCount);
}
export const createProduct = async (req, res) => {
  const productData = req.body;
  const productTitle = req.body.title;
  try {
    const oldProduct = await Product.find({ title: productTitle });
    if (oldProduct.length > 0) {
      return res.status(207).json({
        status: 'fail',
        message: 'Title already exists',
      });
    }

    const newProduct = new Product({
      title: productTitle,
      desc: req.body.desc,
      weight: req.body.weight,
      subUnit: req.body.subUnit,
      category: req.body.category,
    });
    await newProduct.save();
    res.status(201).json({
      status: 'success',
      data: transformationProduct(newProduct),
    });
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const productData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (updatedProduct) {
      res.status(200).json({
        status: "success",
        data: transformationProduct(updatedProduct),
      });
    } else {
      throw new Error(`Product not found`);
    }
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const deletionResult = await Product.deleteOne({ _id: productId });
    if (deletionResult.deletedCount > 0) {
      await SupplierProduct.deleteMany({ productId: productId});
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully.',
      });
    } else {
      throw new Error('Product not found.');
    }
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: 'fail',
      message: error.message || 'Not Found',
    });
  }
};

export const calcAvgRating = async (userId, isCustomer) => {
    if (isCustomer) { // If the user is a customer
      const supplier = await Supplier.findById(userId);
      if (!supplier) {
        throw new Error("Supplier not found");
      }
      const ratings = await Rating.find({
        supplierId: userId,
        user_type: "customer"
      });
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rate, 0);
      supplier.averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      await supplier.save();
    } else {  // If the user is a supplier
      const customer = await Customer.findById(userId);
      if (!customer) {
        throw new Error("Customer not found");
      }
      const ratings = await Rating.find({
        customerId: userId,
        user_type: "supplier"
      });
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rate, 0);
      customer.averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      await customer.save();
    }
};

export const uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

export const storage = (folderName) => multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(`upload/${folderName}`, { recursive: true });
    cb(null, `upload/${folderName}`);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});