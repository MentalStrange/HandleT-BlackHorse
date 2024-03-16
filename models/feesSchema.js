import mongoose  from "mongoose";

const feeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
});

const fineForTrash = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
})

const numberOfPendingDaysOrder = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
})

const fineForCancel = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
})

const Fee = mongoose.model("Fee", feeSchema);
const FineForTrash = mongoose.model("FineForTrash", fineForTrash);
const NumberOfPendingDaysOrder = mongoose.model("NumberOfPendingDaysOrder", numberOfPendingDaysOrder);
const FineForCancel = mongoose.model("FineForCancelOrder", fineForCancel);

export {
  Fee,
  FineForTrash,
  NumberOfPendingDaysOrder,
  FineForCancel
}