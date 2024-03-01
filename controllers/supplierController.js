import mongoose from "mongoose";
import Supplier from "./../models/supplierSchema.js";
import Order from "./../models/orderSchema.js";
import Product from "../models/productSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import {transformationOrder, transformationSupplier, transformationSupplierProduct} from "../format/transformationObject.js";
import paginateResponse from "../utils/paginationResponse.js";
import Unit from "../models/unitSchema.js";
import fs from "fs";

export const getAllSupplier = async (req, res) => {
  try {
    const userRole = req.role;
    let query = { status: "active" };
    const { type } = req.query;
    if (
      type &&
      ["gomla", "gomlaGomla", "blackHorse", "company"].includes(type)
    ) {
      query.type = type;
    } else if (!type) {
      query.type = { $ne: "company" };
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid type filter.",
      });
    }
    let totalSuppliers;
    let suppliers;
    if (userRole === "customer" || userRole === "supplier") {
      totalSuppliers = await Supplier.countDocuments(query);
      suppliers = await Supplier.find(query)
    } else if (userRole === "blackHorse") {
      totalSuppliers = await Supplier.countDocuments(query);
      suppliers = await Supplier.find(query)
    } else {
      return res.status(403).json({
        status: "fail",
        message: "Unauthorized access.",
      });
    }
    if (suppliers.length > 0) {
      paginateResponse(res, req.query, transformationSupplier(suppliers), totalSuppliers);
    } else {
      res.status(404).json({
        status: "fail",
        message: "No suppliers found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getCompany = async (req, res) => {
  try {
    const company = await Supplier.find();
    const activeCompanies = company.filter(
      (company) => company.status === "active" && company.type === "company"
    );
    const totalRecords = activeCompanies.length; 
    const companyTransformation = await Promise.all(
      activeCompanies.map(async (company) => transformationSupplier(company))
    );
    if (companyTransformation.length > 0) {
      paginateResponse(res, req.query, companyTransformation, totalRecords);
    } else {
      res.status(404).json({
        status: "fail",
        message: "Could not find any active companies",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getSupplier = async (req, res) => {
  const id = req.params.id;
  try {
    const supplier = await Supplier.findById(id);
    if (supplier) {
      res.status(200).json({
        status: "success",
        data: await transformationSupplier(supplier),
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const updateSupplier = async (req, res) => {
  let supplierId = req.params.id.trim();
  const supplierData = req.body;
  try {
    // Validate supplierId
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid supplierId format",
      });
    }
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      supplierData,
      { new: true }
    );
    if (updatedSupplier) {
      res.status(200).json({
        status: "success",
        data: await transformationSupplier(updatedSupplier),
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const createProductSupplier = async (req, res) => {
  const supplierId = req.body.supplierId;
  const productId = req.body.productId;
  const productData = req.body;
  const unitId = req.body.unit;
  // const role = req.role;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(207).json({
        status: "fail",
        message: "Product not found",
      });
    }
    const unit = await Unit.findById(unitId);
    let unitWeight = 0;
    if(unit){
      unitWeight = product.weight*unit.maxNumber;
    }
    const supplier = await Supplier.findById(supplierId);
    if(supplier.status === "inactive"){
      return res.status(401).json({
        status: "fail",
        message: "Supplier is inactive",
      });
    }
    if (!supplier) {
      return res.status(207).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
    const oldSupplierProduct= await SupplierProduct.findOne({productId: productId, supplierId: supplierId});
    if (oldSupplierProduct) {
      return res.status(207).json({
        status: "fail",
        message: "Product already exists in supplier list",
      });
    }
    // this check will only apply when add authentication.
    // if(role === "gomlaGomla" || role === "compony" && req.subUnit != null){
    //   return res.status(400).json({
    //     status:"fail",
    //     message:"You should sell By Unit only"
    //   })
    // }
    const newSupplierProduct = await SupplierProduct.create({
      supplierId,
      productId,
      ...productData
    })
    res.status(200).json({
      status: "success",
      data: await transformationSupplierProduct(newSupplierProduct, unitWeight),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail here",
      message: error.message,
    });
  }
};
export const updateProductSupplier = async (req, res) => {
  const supplierId = req.params.id;
  const productId = req.body.productId;
  const productData = req.body;

  try {
    const supplierProductId = await SupplierProduct.findOne({productId: productId, supplierId: supplierId});
    if (supplierProductId) {
      const updatedSupplierProduct = await SupplierProduct.findByIdAndUpdate(
          supplierProductId._id,
          productData,
          { new: true }
      );
      res.status(200).json({
        status: "success",
        data: await transformationSupplierProduct(updatedSupplierProduct),
      });
    } else {
      throw new Error('Product or Supplier not found');
    }
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const deleteProductSupplier = async (req, res) => {
  const supplierId = req.params.id;
  const productId = req.body.productId;
  try {
    const supplierProductId = await SupplierProduct.update({productId: productId, supplierId: supplierId});
    if (supplierProductId) {
      await SupplierProduct.deleteOne({ _id: supplierProductId._id });
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully.',
      });
    } else {
      throw new Error('Product or Supplier not found.');
    }
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const totalSalesBySupplierId = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findById(supplierId);
    let monthSales = req.query.month ? parseInt(req.query.month) : null;
    let query = { supplierId };
    const { date } = req.query; // Added to extract date query parameter
    if (!supplier) {
      return res
        .status(404)
        .json({ status: "fail", message: "Supplier not found." });
    }
    if (
      monthSales &&
      !isNaN(monthSales) &&
      monthSales >= 1 &&
      monthSales <= 12
    ) {
      // Create date range for the specified month
      const startDate = new Date(new Date().getFullYear(), monthSales - 1, 1); // First day of the month
      const endDate = new Date(new Date().getFullYear(), monthSales, 0); // Last day of the month
      query.orderDate = { $gte: startDate, $lte: endDate };
    } else if (date) {
      // If date is provided, filter orders for that specific date
      const orderDate = new Date(date);
      const nextDay = new Date(orderDate);
      nextDay.setDate(nextDay.getDate() + 1); // End of the provided date
      query.orderDate = { $gte: orderDate, $lt: nextDay };
    }
    const orders = await Order.find(query);
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    res.status(200).json({ status: "success", data: totalSales });
  } catch (error) {
    console.error("Error in totalSales function:", error);
    res.status(500).json({ status: "fail", message: "Internal server error." });
  }
};
export const getTotalSales = async (req, res) => {
  try {
    let monthSales = req.query.month ? parseInt(req.query.month) : null;
    let query = {};
    const { date } = req.query; // Added to extract date query parameter
    if (
      monthSales &&
      !isNaN(monthSales) &&
      monthSales >= 1 &&
      monthSales <= 12
    ) {
      // Create date range for the specified month
      const startDate = new Date(new Date().getFullYear(), monthSales - 1, 1); // First day of the month
      const endDate = new Date(new Date().getFullYear(), monthSales, 0); // Last day of the month
      query.orderDate = { $gte: startDate, $lte: endDate };
    } else if (date) {
      // If date is provided, filter orders for that specific date
      const orderDate = new Date(date);
      const nextDay = new Date(orderDate);
      nextDay.setDate(nextDay.getDate() + 1); // End of the provided date
      query.orderDate = { $gte: orderDate, $lt: nextDay };
    }
    const orders = await Order.find(query);
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    res.status(200).json({ status: "success", data: totalSales });
  } catch (error) {
    console.error("Error in totalSales function:", error);
    res.status(500).json({ status: "fail", message: "Internal server error." });
  }
};
export const getOrdersForSupplierInCurrentMonth = async (req, res) => {
  const supplierId = req.params.id;
  const startOfMonth = new Date();
  startOfMonth.setDate(1); // Set to the 1st day of the current month
  startOfMonth.setHours(0, 0, 0, 0); // Set time to midnight

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
  endOfMonth.setDate(0); // Set to the last day of the current month
  endOfMonth.setHours(23, 59, 59, 999); // Set time to end of day

  try {
    const orders = await Order.find({
      supplierId,
      orderDate: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    res.status(200).json({
      status: "success",
      data: totalSales,
    });
  } catch (error) {
    throw new Error("Error fetching orders for supplier: " + error.message);
  }
};
export const lastOrdersBySupplierId = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const page = parseInt(req.query.page) || 1; // Extract page parameter from query string
    const limit = parseInt(req.query.limit) || 10; // Extract limit parameter from query string

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        status: "fail",
        message: "Supplier Not Found",
      });
    }
    
    const totalOrdersCount = await Order.countDocuments({ supplierId });
    const lastOrders = await Order.find({ supplierId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customerId");

    if (lastOrders && lastOrders.length > 0) {
      const formattedOrders = await Promise.all(
        lastOrders.map(async (order) => {
          return await transformationOrder(order); // Transform each order
        })
      );
      paginateResponse(res, req.query, formattedOrders, totalOrdersCount); // Apply pagination to transformed orders
    } else {
      res.status(404).json({
        status: "fail",
        message: "No orders found for the specified supplier ID.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const uploadPhoto = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(207).json({
        status: "fail",
        message: "Supplier not found"
      });
    }

    const pathName = supplier.image.split('/').slice(3).join('/');
    fs.unlink('upload/' + pathName, (err) => {});
    supplier.image = `${process.env.SERVER_URL}${req.file.path.replace(/\\/g, '/').replace(/^upload\//, '')}`;
    await supplier.save();
    return res.status(200).json({
      status: "success",
      data: supplier.image,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};