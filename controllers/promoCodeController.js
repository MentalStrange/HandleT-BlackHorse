import PromoCode from "../models/promocodeSchema.js";
import Supplier from "../models/supplierSchema.js";

export const createPromoCode = async (req, res) => {
  const promoCodeData = req.body;
  const oldPromoCode = req.body.code;
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
    if (oldPromoCode) {
      return res.status(400).json({
        status: "fail",
        message: "Promo code already exists"
      })
    }
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