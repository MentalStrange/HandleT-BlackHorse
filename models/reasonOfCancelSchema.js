import mongoose from "mongoose";

const reasonOfCancelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Reason of cancel should have a name"],
  },
  number:{
    type: Number,
    required: [true, "Reason of cancel should have a number"],
    unique: true
  }
});

const ReasonOfCancel = mongoose.model("ReasonOfCancel", reasonOfCancelSchema);
export default ReasonOfCancel