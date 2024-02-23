import mongoose  from "mongoose";

const feeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
});

const Fee = mongoose.model("Fee", feeSchema);
export default Fee