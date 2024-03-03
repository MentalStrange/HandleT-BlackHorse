import { transformationOffer } from "../format/transformationObject.js";
import Offer from "../models/offerSchema.js"
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";
import fs from "fs";

export const getAllOffer = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default page number is 1
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 offers per page

  try {
    const totalOffers = await Offer.countDocuments();
    const totalPages = Math.ceil(totalOffers / limit);
    const skip = (page - 1) * limit;

    const offers = await Offer.find().skip(skip).limit(limit);

    if (offers.length > 0) {
      const transformedOffers = await Promise.all(offers.map(async (offer) => {
        return await transformationOffer(offer); // Transform each offer
      }));

      res.status(200).json({
        status: "success",
        data: transformedOffers,
        totalPages: totalPages,
        currentPage: page
      });
    } else {
      res.status(200).json({
        status: "success",
        data: [],
        totalPages: totalPages,
        currentPage: page
      });
      // throw new Error('Could not find offers');
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};
export const getOffer = async (req, res) => {
  const offerId = req.params.id;
  try {
    const offer = await Offer.findById(offerId);
    
    if (offer) {
      const transformedOffer = await transformationOffer(offer);
      
      res.status(200).json({
        status: "success",
        data: transformedOffer
      });
    } else {
      throw new Error('Could not find offer');
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};
export const updateOffer = async (req, res) => {
  const offerId = req.params.id;
  const products = req.body.products;
  try {
    // const existProducts = await Promise.all(products.map(async (product) => {
    //   const supplierProduct = await SupplierProduct.findById(product);
    //   const adminProduct = await Product.findById(product);
    //   if(!supplierProduct){
    //     return res.status(404).json({
    //       status:'fail',
    //       message:`Product ${adminProduct.title} Not Found`
    //     })
    //   }else{
    //     return supplierProduct;
    //   }
    // }))
    if (!offerId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Offer ID is missing',
      });
    }
    const offerData = req.body;
    if (!offerData) {
      return res.status(400).json({
        status: 'fail',
        message: 'Offer data is missing',
      });
    }

    const offer = await Offer.findByIdAndUpdate(offerId, offerData, { new: true });
    if (!offer) {
      return res.status(404).json({
        status: 'fail',
        message: 'Could not find offer',
      });
    }
    
    let offerWeight = 0;
    for(const productOffer of offer.products) {
      const supplierProduct = await SupplierProduct.findOne({productId: productOffer.productId, supplierId: offer.supplierId});
      offerWeight += supplierProduct.productWeight * productOffer.quantity;
    }
    offer.weight = offerWeight;
    await offer.save();

    res.status(200).json({
      status: 'success',
      data: await transformationOffer(offer),
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  const offerId = req.params.id;
  try {
    if(offerId){
      const offer = await Offer.findByIdAndDelete(offerId)
      offer.image = offer.image ?? "";
      const pathName = offer.image.split('/').slice(3).join('/');
      fs.unlink('upload/' + pathName, (err) => {});
      res.status(200).json({
        status:"success",
        data:null
      })
    }else{
      throw new Error("Can not found this offer");
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message:error.message,
    })
  }
}

export const createOffer = async (req, res) => {
  const offerData = req.body;
  const supplierId = req.body.supplierId;
  const productIds = req.body.products; // Array of product IDs
  const offerTitle = req.body.title
  try {
    const offer = await Offer.findOne({title:offerTitle});
    if(offer){
      return res.status(400).json({
        status:"fail",
        message:"offer already exist"
      })
    }
    const supplier = await Supplier.findById(supplierId);
    if(!supplier){
      return res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      })
    }
    if (!offerData) {
      throw new Error(`Offer data is required`);
    }
    if (!supplierId) {
      throw new Error(`Supplier ID is required`);
    }
    if (!productIds || productIds.length === 0) {
      throw new Error(`Product IDs are required`);
    }
    const existingOffer = await Offer.findOne({ supplierId, productId: { $all: productIds } });
    if (existingOffer) {
      return res.status(400).json({
        status: "fail",
        message: "An offer for the same products by the same supplier already exists",
      });
    }

    const newOffer = new Offer(offerData);
    await newOffer.save();
    res.status(201).json({
      status: "success",
      data: await transformationOffer(newOffer),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const changeImageOffer = async (req, res) => {
  const offerId = req.params.id;
  try{
    const offer = await Offer.findById(offerId);
    if(!offer){
      return res.status(404).json({
        status: "fail",
        message: "Offer not found",
      })
    }
    offer.image = offer.image ?? "";
    const pathName = offer.image.split('/').slice(3).join('/');
    fs.unlink('upload/' + pathName, (err) => {});
    offer.image = `${process.env.SERVER_URL}${req.file.path.replace(/\\/g, '/').replace(/^upload\//, '')}`;
    await offer.save();
    res.status(201).json({
      status: "success",
      data: await transformationOffer(offer),
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
}

export const getOfferBySupplierId = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const supplier = await Supplier.findById(supplierId);
    if(!supplier || supplier.status === 'inactive'){
      return res.status(200).json({
        status: "fail",
        data:[],
        message: "Supplier not found",
      })
    }
    const offers = await Offer.find({ supplierId });
    if (offers && offers.length > 0) {
      const transformedOffers = await Promise.all(offers.map(async (offer) => {
        return await transformationOffer(offer);
      }));
      res.status(200).json({
        status: "success",
        data: transformedOffers
      });
    } else {
      return res.status(200).json({
        status: "fail",
        data:[],
        message: "No offers found"
      })
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};

export const getOfferByOrderId = async (req, res) => {
  const orderId = req.params.id;
  try {
    const orders = await Order.findOne({ _id: orderId });
    if (orders && orders.offers && orders.offers.length > 0) { // Check if offers array is not empty
      const transformedOffers = await Promise.all(orders.offers.map(async (offerId) => {
        const offer = await Offer.findById(offerId.offer);
        return await transformationOffer(offer);
      }));
      res.status(200).json({
        status: "success",
        data: transformedOffers
      });
    } else {
      return res.status(404).json({
        status: "fail",
        data:[],
        message: "No offers found"
      })
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};
