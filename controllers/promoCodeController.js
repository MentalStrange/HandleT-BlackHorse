import PromoCode from "../models/promocodeSchema.js";
import Supplier from "../models/supplierSchema.js";

export const createPromoCode = async (req, res) => {
  const promoCodeData = req.body;
  try {
    const createdPromoCode = await PromoCode.create(promoCodeData);
    if (createdPromoCode) {
      res.status(201).json({
        status: "success",
        data: createdPromoCode,
      });
    }
  } catch (error) {    
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const applyPromoCode = async (req, res) => {
  const promoCode = req.body.code;
  try {
    const appliedPromoCode = await PromoCode.findOne({ code: promoCode });
    if (appliedPromoCode) {
      res.status(200).json({
        status: "success",
        data: appliedPromoCode,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Promo code not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}

export const getAllPromoCode = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json({
      status: "success",
      data: promoCodes,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}

export const deletePromoCode = async (req, res) => {
  const promoCodeId = req.params.id;
  try {
    if (promoCodeId) {
      await PromoCode.deleteOne({ _id: promoCodeId });
      res.status(204).json({
        status: "success",
        data: null,
      });
    } else {
      throw new Error(`Promo code can not be founded`);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
}

export const updatePromoCode = async (req, res) => {
  const promoCodeId = req.params.id;
  const promoCodeData = req.body;
  try {
    if (promoCodeId) {
      const promocode = await PromoCode.findOneAndUpdate({ _id: promoCodeId }, promoCodeData, { new: true } );
      res.status(200).json({
        status: "success",
        data: promocode,
      });
    } else {
      throw new Error(`Promo code can not be founded`);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
}