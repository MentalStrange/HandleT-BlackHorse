import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Region should have a name"],
  },
});
const Region = mongoose.model("Region", regionSchema);
export default Region