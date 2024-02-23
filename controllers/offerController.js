import Offer from "../models/offerSchema.js"
import Order from "../models/orderSchema.js";

export const getAllOffer = async (req, res) => {
  try {
    const offers = await Offer.find();
    if (offers) {
      res.status(200).json({
        status: "success",
        data: offers
      });
    } else {
      throw new Error('Could not find offers');
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: "error here"
    });
  }
};
export const getOffer = async (req, res) => {
  const offerId = req.params.id;
  try {
    const offer = await Offer.findById(offerId);
    if(offer){
      res.status(200).json({
        status:"success",
        data: offer
      })
    }else{
      throw new Error('Could not find offer');
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message:error.message
    })
  }
}

export const updateOffer = async (req, res) => {
  const offerId = req.params.id;
  try {
    if (offerId) {
      const offerData = req.body;
      const offer = await Offer.findByIdAndUpdate(offerId, offerData, { new: true });
      if (offer) {
        res.status(200).json({
          status: "success",
          data: offer,
        });
      } else {
        throw new Error('Could not find offer');
      }
    } else {
      throw new Error('OfferId is missing');
    }
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
  try {
    if (offerData) {
      const newOffer = new Offer(offerData);
      await newOffer.save();  // Save the new offer to the database
      res.status(201).json({
        status: "success",
        data: newOffer,  // Corrected from "date" to "data"
      });
    } else {
      throw new Error(`Offer cannot be created`);
    }
  } catch (error) {
    res.status(501).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getOfferBySupplierId = async (req,res) => {
  const supplierId = req.params.id;
  try {
    const offers = await Offer.find({supplierId});
    if(offers){
      res.status(200).json({
        status:"success",
        data: offers
      })
    }else{
      throw new Error('Could not find offers');
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message:error.message
    })
  }
}

export const getOfferByOrderId = async (req,res)=>{
  const orderId = req.params.id;
  try {
    const orders = await Order.find({orderId});
    if(orders.offers){
      res.status(200).json({
        status:"success",
        data: orders
      })
    }else{
      throw new Error('Could not find offers');
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message:error.message
    })
  }
}


