import mongoose from 'mongoose';
import SupplierProduct from './supplierProductSchema.js';

const offerProduct = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplierProduct',
  },
  quantity: {
    type: Number,
  },
  
})
const offerSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  products: [
    {
      type: offerProduct
    }
  ],
  title: {
    type: String,
    required: [true, 'Offer should have a description'],
  },
  price: {
    type: Number,
    required: [true, 'Offer should have a Price'],
  },
  afterSale: {
    type: Number,
  },
  maxLimit: {
    type: Number,
  },
  weight: {
    type: Number,
    // required: [true, 'Offer should have a weight'],
  },
  stock: {
    type: Number,
    required: [true, 'Offer should have a stock'],
  },
  image: {
    type: String,
    // required: [true, 'Offer should have a image'],
  },
  desc:{
    type: String,
    required: [true, 'Offer should have a description'],
  }
},
{
  timestamps: true,
});

// offerSchema.pre('save', async function (next) {
//   try {
//     const Product = mongoose.model('Product');
//     const SupplierProduct = mongoose.model('SupplierProduct');
    
//     // Fetching products and calculating individual weights
//     const products = await Promise.all(this.products.map(async (offerProduct) => {
//       const adminProduct = await Product.findById(offerProduct.productId);
//       if (!adminProduct) throw new Error('Product not found');
//       const supplierProduct = await SupplierProduct.findOne({productId: adminProduct._id, supplierId: this.supplierId});
//       console.log("offerProduct:", supplierProduct);
//       if (!supplierProduct) throw new Error('Product not found for supplier');
//       return { ...supplierProduct.toObject(), quantity: offerProduct.quantity };
//     }));

//     // Calculating total weight of the offer
//     const totalWeight = products.reduce((sum, product) => sum + (product.productWeight * product.quantity), 0);

//     // Setting the total weight to the offer
//     this.weight = totalWeight;

//     next();
//   } catch (error) {
//     next(error);
//   }
// });


// offerSchema.pre('findOneAndUpdate', async function (next) {
//   try {
//     const Product = mongoose.model('Product');
//     const update = this._update.$set; // Get the $set part of the update object
//     console.log('hello');
//     if (!update || !update.products || !Array.isArray(update.products)) {
//       return next(); // Skip processing if products array is not present or not an array
//     }
//     const products = await Promise.all(update.products.map(async (offerProduct) => {
//       const product = await Product.findById(offerProduct.productId);
//       console.log('product', product);
//       if (!product) throw new Error('Product not found');
//       return { ...product.toObject(), quantity: offerProduct.quantity }; // Include quantity for weight calculation
//     }));
//     const totalWeight = products.reduce((sum, product) => sum + (product.weight * product.quantity), 0);
//     this._update.$set.weight = totalWeight;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });


const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
