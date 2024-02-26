import mongoose from 'mongoose';
import Supplier from './supplierSchema.js';
import GroupExpireDate from './groupExpireDate.js';

const groupSchema = mongoose.Schema({
  region:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Region",
    required:[true, "Group should have a region"]
  },
  supplierId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Supplier",
    required:[true, "Group should have a supplier Id"],
  },
  customer:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Customer",
    }
  ],
  maximumCustomer:{
    type:Number,
  },
  numberOfCustomer:{
    type:Number,
  },
  status:{
    type:String,
    enum:["pending","complete","expired","cancelled","delivery"],
    default:"pending",
  },
  order:[
    {type:mongoose.Schema.Types.ObjectId,
    ref:"Order",}
  ],
  daysOfExpire:{
    type:Number,
  },
  createdAt:{
    type:Date,
    default: Date.now,
  }
},{
  timestamps:true,
})

groupSchema.pre("save", async function(next){
  try {
    const expireDate = await GroupExpireDate.findOne();
    this.daysOfExpire = expireDate.date;
    next();
  } catch (error) {
    next(error);
  }
})
groupSchema.pre("findOneAndUpdate", async function(next) {
  try {
    if (this.isNew) {
      const totalPrice = this.orders.reduce((acc, order) => acc + order.price, 0);
      const supplier = await Supplier.findById(this.supplierId);
      const minPrice = supplier.minOrderPrice;
      if (totalPrice >= minPrice) {
        this.status = "complete";
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});
const Group = mongoose.model('Group',groupSchema);
export default Group;