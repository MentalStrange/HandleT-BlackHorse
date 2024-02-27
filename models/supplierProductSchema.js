import mongoose from 'mongoose';

const supplierProductSchema = mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required:[true, 'Supplier is required'],
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:[true, 'productId is required'],
    },
    price:{
        type:Number,
        required:[true, 'Product should have a price'],
    },
    stock:{
        type:Number,
        required:[true, 'Product should have a stock'],
        default:1
    },
    afterSale:{
      type:Number,
    },
    maxLimit:{
      type:Number,
    },
    unit:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Unit",
    },
    numberOfSubUnit:{
      type:Number,
    },
    subUnit:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"SubUnit",
    },
})

const SupplierProduct = mongoose.model('SupplierProduct', supplierProductSchema);

export default SupplierProduct;