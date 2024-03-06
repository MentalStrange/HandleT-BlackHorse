import mongoose from 'mongoose';
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
  // maximumCustomer:{
  //   type:Number,
  // },
  numberOfCustomer:{
    type:Number,
  },
  status:{
    type:String,
    enum:["pending","complete","expired","canceled","delivery","accepted"],
    default:"pending",
  },
  // order:[
  //   {type:mongoose.Schema.Types.ObjectId,
  //   ref:"Order",}
  // ],
  expireDate:{
    type:Date,
  },
  createdAt:{
    type:Date,
    default: Date.now,
  },
  deliveryBoy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"DeliveryBoy"
  },
  totalPrice:{
    type:Number,
    default:0,
  }
},{
  timestamps:true,
})

groupSchema.pre("save", async function(next) {
  try {
    const expireDateConfig = await GroupExpireDate.findOne();    
    if (!expireDateConfig) {
      throw new Error("Expiration date configuration not found");
    }
    const daysToAdd = expireDateConfig.date;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToAdd);
    this.expireDate = expirationDate;
    next(); 
  } catch (error) {
    next(error);
  }
});
// groupSchema.pre("findOneAndUpdate", async function(next) {
//   try {
//     if (this.isNew) {
//       const totalPrice = this.orders.reduce((acc, order) => acc + order.price, 0);
//       const supplier = await Supplier.findById(this.supplierId);
//       const minPrice = supplier.minOrderPrice;
//       if (totalPrice >= minPrice) {
//         this.status = "complete";
//       }
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });
const Group = mongoose.model('Group',groupSchema);
export default Group;