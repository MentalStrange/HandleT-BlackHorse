import mongoose from 'mongoose';

const elasticOrderSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  reasonOfCancel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReasonOfCancel",
    required: true
  },
  type:{
    type: String,
    enum: ["trashOrder", "canceledOrder"],
    required: true
  },
  createdAt:{
    type:Date,
    default: Date.now,
  }

});

const ElasticOrder = mongoose.model("ElasticOrder", elasticOrderSchema);
export default ElasticOrder