import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Region should have a name"],
  },
});
regionSchema.pre('remove', async function(next){
  try {
    await this.model('Supplier').deleteMany({ region: this._id });
    await this.model('Group').deleteMany({ region: this._id });
    await this.model('Customer').deleteMany({ region: this._id });
    await this.model('DeliveryBoy').deleteMany({ region: this._id });
    next();
  } catch (error) {
    next(error);
  }
})
const Region = mongoose.model("Region", regionSchema);
export default Region