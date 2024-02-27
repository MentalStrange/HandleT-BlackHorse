import { transformationOffer } from "../format/transformationObject.js";
import Offer from "../models/offerSchema.js"
import Order from "../models/orderSchema.js";
import Supplier from "../models/supplierSchema.js";

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
      throw new Error('Could not find offers');
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
  try {
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
    res.status(200).json({
      status: 'success',
      data: offer,
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
      await Offer.findByIdAndDelete(offerId);
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
      data: newOffer,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getOfferBySupplierId = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const offers = await Offer.find({ supplierId });
    if (offers && offers.length > 0) { // Check if offers array is not empty
      const transformedOffers = await Promise.all(offers.map(async (offer) => {
        return await transformationOffer(offer); // Transform each offer
      }));
      res.status(200).json({
        status: "success",
        data: transformedOffers
      });
    } else {
      return res.status(404).json({
        status: "fail",
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
    const orders = await Order.findOne({ _id: orderId }).populate('offers');
    if (orders && orders.offers && orders.offers.length > 0) { // Check if offers array is not empty
      const transformedOffers = await Promise.all(orders.offers.map(async (offer) => {
        return await transformationOffer(offer); // Transform each offer
      }));
      res.status(200).json({
        status: "success",
        data: transformedOffers
      });
    } else {
      throw new Error('Could not find offers');
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};



