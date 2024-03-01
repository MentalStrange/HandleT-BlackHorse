import mongoose from "mongoose";

const customerSchema =  mongoose.Schema({
  name:{
    type:String,
    required:[true, "Customer should have a name"]
  },
  email:{
    type:String,
    required:[true,'Customer Should have an email'],
    unique:true,
    match: /^\S+@\S+\.\S+$/,
  },
  password:{
    type:String,
    required:[true,'Customer Should have a password']
  },
  image:{
    type:String,
  },
  phone:{
    type:String,
    // required:[true,'Customer Should have a Phone']
  },
  region:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Region",
    // required:[true,'Customer Should have a region']
  },
  address:{
    type:String,
  },
  district:{
    type:String,
  },
  governorate:{
    type:String,
  },
  resetCode: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  totalRating:{
    type:Number,
  },
  averageRating:{
    type:Number,
  },
  status:{
    type:String,
    enum:["active","inactive"],
    default:"active"
  }
}, {
  timestamps: true,
})

const Customer = mongoose.model("Customer",customerSchema);
export default Customer;
