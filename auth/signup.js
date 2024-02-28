import Customer from "../models/customerSchema.js";
import Supplier from "../models/supplierSchema.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {transformationCustomer} from "../format/transformationObject.js";
const salt = 10 ;

export const createSupplier = async (req, res) => {
  const supplierData = req.body;
  const supplierEmail = req.body.email;
  try {
    const oldSupplier = await Supplier.find({ email: supplierEmail.toLowerCase() });
    if (oldSupplier.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Supplier already exists',
      });
    }
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newSupplier = new Supplier({
      ...supplierData,
      email: supplierEmail.toLowerCase(),
      password: hashedPassword,
    });
    await newSupplier.save();
    res.status(201).json({
      status: 'success',
      data: newSupplier,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Internal Server Error',
    });
  }
};

export const createCustomer = async (req,res) => {
  const customerData = req.body;
  const customerEmail = req.body.email;
  try {
    const oldCustomer = await Customer.find({ email: customerEmail });
    if (oldCustomer.length > 0) {
      return res.status(404).json({
        status: 'fail',
        message: req.headers['language'] === 'en' ? 'email already exists' : 'الايميل الإلكتروني موجود بالفعل',
      });
    }
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password.toString(), salt);
    const newCustomer= new Customer({
      ...customerData,
      password: hashedPassword,
    });
    await newCustomer.save();
    res.status(201).json({
      status: 'success',
      data: transformationCustomer(newCustomer),
      access_token: jwt.sign({_id: newCustomer._id, role: "customer"}, process.env.JWT_SECRET, {})
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      status: 'fail',
      message: error.message || 'Internal Server Error',
    });
  }
}