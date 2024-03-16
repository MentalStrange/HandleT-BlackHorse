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

const fineForPending = new mongoose.Schema({
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
const FineForPending = mongoose.model("FineForPendingOrder", fineForPending);
const FineForCancel = mongoose.model("FineForCancelOrder", fineForCancel);

export {
  Fee,
  FineForTrash,
  FineForPending,
  FineForCancel
}