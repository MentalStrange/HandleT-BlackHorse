import mongoose from 'mongoose';

const regionGroupSchema = mongoose.Schema({
  name:{
    type:String,
    required:[true, "Group should have a name"]
  },
  region:{
    type:String,
    required:[true, "Group should have a region"]
  },
  supplierId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Supplier",
    required:[true, "Group should have a supplier Id"],
  },
  customers:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Customer",
    }
  ],
  maximumCustomer:{
    type:Number,
  },
  orders:[
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

const RegionGroup = mongoose.model('RegionGroup',regionGroupSchema);
export default RegionGroup;