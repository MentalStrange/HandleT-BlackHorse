import mongoose from 'mongoose';
import SupplierProduct from './supplierProductSchema.js';

const productSchema = mongoose.Schema({
  title:{
    type:String,
    required:[true, 'Product should have a name'],
    unique: [true, 'Product should have a unique title'],
  },
  desc:{
    type:String,
    required:[true, 'Product should have a description'],
  },
  weight:{
    type:Number,
    required:[true, 'Product should have a weight'],
  },
  subUnit:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubUnit",
    required:[true, 'Product should be associated with a subUnit']
  },
  images:[{
    type:String,
    // required:[true, 'Product should have images']
  }],
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
    required:[true, 'Product should be associated with a category']
  },
  // price:{
  //   type:Number,
  //   required:[true, 'Product should have a price'],
  // },
  // afterSale:{
  //   type:Number,
  //   required:[true, 'Product should have a afterSale'],
  //
  // },
  // maxLimit:{
  //   type:Number,
  //   required:[true, 'Product should have a maxLimit'],
  // },
  // unit:{
  //   type:mongoose.Schema.Types.ObjectId,
  //   ref:"Unit",
  // },
  // quantity:{
  //   type:Number,
  //   required:[true, 'Product should have a quantity'],
  //   default:1
  // },
  // numberOfSubUnit:{
  //   type:Number,
  // },
  // stock:{
  //   type:Number,
  //   required:[true, 'Product should have a stock'],
  //   default:1
  // },
})

productSchema.pre('remove', async function(next){
  try {
    await SupplierProduct.deleteMany({ productId: this._id });
    next();
  } catch (error) {
    next(error)
  }
})
const Product = mongoose.model("Product",productSchema);
export default Product;