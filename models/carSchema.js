import mongoose from 'mongoose';
const carSchema = mongoose.Schema({
  type:{
    type:String,
    // required:[true, "Car should have a type"],
  },
  maxWeight:{
    type:Number,
    // required:[true, "Car should have a maxWeight"],
  },

})

const Car = mongoose.model('Car', carSchema);
export default Car;