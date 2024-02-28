import PromoCode from "../models/promocodeSchema.js";
import Supplier from "../models/supplierSchema.js";

export const createPromoCode = async (req, res) => {
  const promoCodeData = req.body;
  const supplierId = req.body.supplierId;
  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        status: "fail",
        message: "Supplier not found"
      })
    }
    const createdPromoCode = await PromoCode.create(promoCodeData);
    if (createdPromoCode) {
      res.status(201).json({
        status: "success",
        data: createdPromoCode,
      });
    }
  } catch (error) {
    console.log('error',error.status);
    
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
    if (promoCodes) {
      res.status(200).json({
        status: "success",
        data: promoCodes,
      });
    } else {
      throw new Error("Could not find promo codes");
    }
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
      res.status(404).json({
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
      await PromoCode.updateOne({ _id: promoCodeId }, promoCodeData);
      res.status(200).json({
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