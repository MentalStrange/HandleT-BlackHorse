import mongoose from 'mongoose';
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
  quantity: {
    type: Number,
    required: [true, 'Offer should have a quantity'],
  },
  afterSale: {
    type: Number,
    required: [true, 'Offer should have a discount'],
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
    required: [true, 'Offer should have a image'],
  },
  startDate: {
    type: Date,
    required: [true, 'Offer should have a starting date'],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'Offer should have an ending date'],
  },
},
{
  timestamps: true,
});

offerSchema.pre('save', async function (next) {
  const Product = mongoose.model('Product');
  const products = await Promise.all(this.products.map(async (offerProduct) => {
    const product = await Product.findById(offerProduct.productId);
    if (!product) throw new Error('Product not found');
    console.log('product', product);
    return product;
  }));
  const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
  this.weight = totalWeight*this.quantity;
  next();
});

offerSchema.pre('findByIdAndUpdate', async function (next) {
  const Product = mongoose.model('Product');
  const products = await Promise.all(this.products.map(async (offerProduct) => {
    const product = await Product.findById(offerProduct.productId);
    if (!product) throw new Error('Product not found');
    console.log('product', product);
    return product;
  }));
  const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
  this.weight = totalWeight*this.quantity;
  next();
});

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
