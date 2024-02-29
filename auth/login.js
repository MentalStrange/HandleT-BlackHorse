import Customer from "../models/customerSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Supplier from "../models/supplierSchema.js";
import {transformationCustomer, transformationDeliveryBoy, transformationSupplier} from "../format/transformationObject.js";
import DeliveryBoy from "../models/deliveryBoySchema.js";
const salt = 10 ;

export const customerLogin = async (req, res) => {
  const customerEmail = req.body.email;
  const customerPassword = req.body.password;
  try {
    const customer = await Customer.find({ email: customerEmail });
    if (customer.length === 0) {
      return res.status(203).json({ // email not found
        status: "fail",
        message: req.headers['language'] === 'en' ? "Verify your email or password" : "قم من التحقق من البريد الإلكتروني أو كلمة المرور",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
        customerPassword,
        customer[0]._doc.password
    );
    if (!isPasswordMatch) {
      return res.status(203).json({ // password incorrect
        status: "fail",
        message: req.headers['language'] === 'en' ? "Verify your email or password" : "قم من التحقق من البريد الإلكتروني أو كلمة المرور",
      });
    }
    const cust = customer[0]._doc;
    res.status(200).json({
      status: "success",
      data: {...transformationCustomer(cust), access_token: jwt.sign({_id: cust._id, role: "customer"}, process.env.JWT_SECRET, {})},
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const supplierLogin = async (req, res) => {
  const supplierEmail = req.body.email;
  const supplierPassword = req.body.password;
  try {
    const supplier = await Supplier.find({ email: supplierEmail.toLowerCase() });
    if (supplier.length === 0) {
      return res.status(207).json({
        status: "fail",
        message: "Supplier Not Found",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      supplierPassword,
      supplier[0].password
    );
    if (!isPasswordMatch) {
      return res.status(207).json({
        status: "fail",
        message: "Password Not Correct",
      });
    }
    const { password, ...rest } = supplier[0]._doc ;
    if(rest.type === "blackHorse"){
      res.status(200).json({
        status: "success",
        data: {...(await transformationSupplier(supplier[0]._doc)), access_token: jwt.sign({_id: rest._id, role: "blackHorse"}, process.env.JWT_SECRET, {})},
      });
    }
    else{
      res.status(200).json({
        status: "success",
        data:  {...(await transformationSupplier(supplier[0]._doc)), access_token: jwt.sign({_id: rest._id, role: req.role}, process.env.JWT_SECRET, {})},
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const deliveryBoyLogin = async (req, res) => {
  const deliveryBoyEmail = req.body.email;
  const deliveryBoyPassword = req.body.password;
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ email: deliveryBoyEmail });
    if (!deliveryBoy) {
      return res.status(404).json({
        status: "fail",
        message: "Delivery Boy Not Found",
      });
    }
    // Compare passwords using bcrypt.compare
    const isPasswordMatch = await bcrypt.compare(
      deliveryBoyPassword,
      deliveryBoy.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect Password",
      });
    }
    const { password, ...rest } = deliveryBoy._doc;
    const deliveryBoyData = { ...rest, access_token: jwt.sign({_id: rest._id, role: "deliveryBoy"}, process.env.JWT_SECRET, {})};
    res.status(200).json({
      status: "success",
      data: await transformationDeliveryBoy({...deliveryBoyData,password}),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

