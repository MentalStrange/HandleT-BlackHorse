import Category from "../models/categorySchema.js"
import Order from "../models/orderSchema.js";
import Customer from "../models/customerSchema.js";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import {transformationCustomer} from "../format/transformationObject.js";

export const getAllCategory = async (req,res) => {
  try {
    const category = await Category.find().sort(req.query.category);
    if(category){
      res.status(200).json({
        status:"success",
        data: category
      })
    }else{
      throw new Error("Couldn't find category");
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message: error.message
    }); 
  }
}

export const getCustomerById = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer= await Customer.findOne({_id: customerId});
    if(!customer){
      return res.status(207).json({
        status:"fail",
        message:"Customer not found"
      })
    }

    return res.status(200).json({
      status: "success",
      data: transformationCustomer(customer),
    });
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message: error.message
    });
  }
}

export const updateCustomer = async (req, res) => {
  const customerId = req.params.id;

  try {
    const customer= await Customer.findOne({_id: customerId});
    if(!customer){
      return res.status(207).json({
        status:"fail",
        message:"Customer not found"
      })
    }

    const customerData = req.body;
    if (customerData.name !== undefined) {
      customer.name = customerData.name;
    }
    if (customerData.phone !== undefined) {
      customer.phone = customerData.phone;
    }
    if (customerData.address !== undefined) {
      customer.address = customerData.address;
    }
    if (customerData.district !== undefined) {
      customer.district = customerData.district;
    }
    if (customerData.governorate !== undefined) {
      customer.governorate = customerData.governorate;
    }
    if (customerData.status !== undefined) {
      customer.status = customerData.status;
    }
    await customer.save();
    return res.status(200).json({
      status: "success",
      data: transformationCustomer(customer),
      message: req.headers['language'] === 'en' ? "Customer data updated successfully" : "تم تعديل بيانات العميل بنجاح"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}

/************************************ UploadPhoto Customer ************************************/

// Configure Multer to handle file uploads
const storage = multer.diskStorage({
  destination: './upload/customer',
  filename: (req, file, callback) => {
    const customerId = req.params.id;
    callback(null, `${customerId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage }).single('image');

// Function to handle file upload
export const uploadPhoto = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading file.');
    }

    const customerId = req.params.id;
    try {
      const customer = await Customer.findOne({ _id: customerId });
      if (!customer) {
        return res.status(207).json({
          status: "fail",
          message: "Customer not found"
        });
      }

      // Upload image to Cloudinary
      await cloudinary.uploader.upload(
          req.file.path, {
            public_id: customerId, // .${path.extname(req.file.originalname)}
            overwrite: true
          }, async (error, result) => {
        fs.unlinkSync(req.file.path);         // Delete the temporary file
        if (error) {
          console.error(error);
          return res.status(500).json({
            status: "error",
            message: "Internal server error"
          });
        }

        customer.image = result.secure_url;
        await customer.save();
        return res.status(200).json({
          status: "success",
          data: transformationCustomer(customer),
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  });
};

/************************************ DeletePhoto Customer ************************************/
// Define the directory where the images are stored
const uploadDirectory = './upload/customer';

export const deletePhoto = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findOne({_id: customerId});
    if (!customer) {
      return res.status(207).json({
        status: "fail",
        message: "Customer not found"
      })
    }
2
    const imagePath =  path.join(uploadDirectory, path.basename(customer['image']));
    // Check if the file exists
    fs.stat(imagePath, (err, stats) => {
      if (err) {
        console.error('Error accessing file:', err);
        return;
      }

      fs.unlink(imagePath, async (err) => { // Delete the file
        if (err) {
          console.error('Error deleting file:', err);
          return;
        }
        customer.image = null;
        await customer.save();
        return res.status(200).json({
          status: "success",
          data: transformationCustomer(customer),
          message: req.headers['language'] === 'en' ? "The account photo has been successfully deleted" : "تم مسح صورة الحساب بنجاح"
        });
      });
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};