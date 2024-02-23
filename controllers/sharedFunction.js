import Product from "../models/productSchema.js";
import mongoose, {connect} from "mongoose";
import Customer from "../models/customerSchema.js";
import Rating from "../models/ratingSchema.js";
import Supplier from "../models/supplierSchema.js";
import {transformationCustomer, transformationProduct} from "../format/transformationObject.js";
import jwt from "jsonwebtoken";

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

    // const newProduct = new Product(productData);
    // await newProduct.save();
    // const populatedProduct = await Product.findById(newProduct._id).populate('category');
    // const categoryName = populatedProduct.category.name;
    // const response = {
    //   status: "success",
    //   data: {
    //     ...populatedProduct.toObject(),
    //     category: categoryName,
    //   },
    // };
    // res.status(201).json(response);
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const unit = productData.unit;
    const existingProduct = await Product.findOne({ unit: unit });
    if (existingProduct && existingProduct._id != productId) {
      throw new Error(`Unit or subunit '${unit}' already exists`);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (updatedProduct) {
      res.status(200).json({
        status: "success",
        data: updatedProduct,
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
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID.');
    }
    const deletionResult = await Product.deleteOne({ _id: productId });
    if (deletionResult.deletedCount > 0) {
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
  // try {
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
  // } catch (error) {
  //   res.status(500).json({
  //     status:"fail",
  //     message:error.message
  //   })
  // }
};

