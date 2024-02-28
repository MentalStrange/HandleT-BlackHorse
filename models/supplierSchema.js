import mongoose from "mongoose";
import SupplierProduct from "./supplierProductSchema.js";

const supplierSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Supplier Should have a name"],
  },
  email: {
    type: String,
    required: [true, "Supplier Should have an email"],
    unique: [true, "Email Should be unique"],
    match: /^\S+@\S+\.\S+$/,
  },
  password: {
    type: String,
    required: [true, "Supplier Should have a password"],
  },
  nationalId:{
    type:Number,
    required:[true,"Supplier Should have a National Id"],
    unique:true,
  },
  wallet:{
    type:Number,
    default:0
  },
  desc: {
    type: String,
    // required: [true, "Supplier Should have a description"],
  },
  minOrderPrice: {
    type: Number,
    required: [true, "Supplier Should have a Minimum Receipt"],
  },
  // maxOrderWeight: {
  //   type: Number,
  //   required: [true, "Supplier Should have a Maximum Weight for every receipt"],
  // },
  deliveryRegion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: [
        true,
        "Supplier Should have a Delivery Region for every receipt",
      ],
    },
  ],
  workingDays: [
    {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
  ],
  phone: {
    type: String,
  },
  workingHours: [
    {
      type: Number,
    },
  ],
  type: {
    type: String,
    enum: ["gomla", "nosGomla", "gomlaGomla", "company", "blackHorse"],
  },
  image: {
    type: String,
    required: [true, "Supplier Should have an image"],
  },
  placeImage: [
    {
      type: String,
      required: [true, "Supplier Should have an image"],
    },
  ],
  deliveryDaysNumber: {
    type: Number,
    required: [
      true,
      "Supplier Should have a  Delivery Days Number for every receipt",
    ],
  },
  // products: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Product"
  //   }
  // ],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  totalRating:{
    type:Number,
  },
  averageRating:{
    type: Number,
  },
});
supplierSchema.pre("remove", async function (next) {
  try {
    await SupplierProduct.deleteMany({ supplierId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
