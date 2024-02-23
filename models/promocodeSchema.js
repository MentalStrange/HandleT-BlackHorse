import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  supplierId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Supplier",
    required:[true, 'promoCode must have supplier']
  },
  customerId:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Customer",
  }]
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema)
export default PromoCode
