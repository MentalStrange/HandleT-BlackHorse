import mongoose from 'mongoose';

const deliveryBoySchema = mongoose.Schema({
  name:{
    type:String,
    required:[true, "Delivery Boy should have a name"]
  },
  email:{
    type:String,
    required:[true,'Delivery Boy Should have an email'],
    unique:true,
    match: /^\S+@\S+\.\S+$/, 
  },
  password:{
    type:String,
    required:[true,'Delivery Boy Should have a password']
  },
  image:{
    type:String,
    // required:[true,'Delivery Boy Should have an image'],
  },
  phone:{
    type:String,
  },
  region:{
    type:String,
    required:[true,'Delivery Boy Should have a region']
  },
  address: [{
    city: String,
    state: String,
    streetNumber: String,
    country: String,
  }],
  orders:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order",
  }]
})

const DeliveryBoy = mongoose.model('Delivery Boy',deliveryBoySchema);
export default DeliveryBoy;