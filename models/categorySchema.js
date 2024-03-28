import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category should have a name"],
  },
  image: {
    type: String,
    required: [true, "Category should have an image"],
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
