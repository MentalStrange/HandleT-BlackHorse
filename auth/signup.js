import Customer from "../models/customerSchema.js";
import Supplier from "../models/supplierSchema.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {transformationCustomer, transformationSupplier} from "../format/transformationObject.js";
import Region from "../models/regionSchema.js";
const salt = 10 ;

export const createSupplier = async (req, res) => {
  const supplierData = req.body;
  const supplierEmail = req.body.email;
  const regionsId = req.body.deliveryRegion;

  try {
    // Check for existing supplier using findOne
    const existingSupplier = await Supplier.findOne({ email: supplierEmail });
    if (existingSupplier) {
      return res.status(400).json({
        status: 'fail',
        message: 'Supplier already exists',
      });
    }
    // Validate all regions first
    const regionPromises = regionsId.map(async (region) => {
      const regionName = await Region.findById(region);
      if (!regionName) {
        throw new Error(`Region with ID ${region} not found`);
      }
      return regionName.name;
    });

    try {
      const deliveryRegion = await Promise.all(regionPromises);
      console.log('deliveryRegion', deliveryRegion);
      // All regions are valid, proceed with supplier creation
      const password = req.body.password;    
      const hashedPassword = await bcrypt.hash(password, salt);
      const newSupplier = await Supplier.create({
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phoneNumber,
        image: supplierData.image,
        nationalId: supplierData.nationalId,
        minOrderPrice: supplierData.minOrderPrice,
        // deliveryRegion: deliveryRegion,
        workingDays: supplierData.workingDays,
        workingHours: supplierData.workingHours,
        deliveryDaysNumber: supplierData.deliveryDaysNumber,
        type: supplierData.type,
        password: hashedPassword,
      });
      console.log('newSupplier', newSupplier);
      
      return res.status(201).json({
        status: 'success',
        data: await transformationSupplier(newSupplier),
      });
    } catch (regionError) {
      // Error occurred during region validation, return error response
      return res.status(400).json({
        status: 'fail',
        message: regionError.message,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
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