import mongoose from 'mongoose';


const offerSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  productId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierProduct',
    },
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
  const products = await Product.find({ _id: { $in: this.productId } });
  const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
  this.weight = totalWeight;
  next();
});

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
