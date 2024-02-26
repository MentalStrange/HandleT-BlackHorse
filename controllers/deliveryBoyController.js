import { transformationDeliveryBoy } from "../format/transformationObject.js";import Car from "../models/carSchema.js";
import DeliveryBoy from "../models/deliveryBoySchema.js";
export const createDeliveryBoy = async (req, res) => {
  const deliverBoyData = req.body;
  const deliveryBoyEmail = req.body.email;
  try {
    const oldDeliveryBoy = await DeliveryBoy.find({ email: deliveryBoyEmail });
    if (oldDeliveryBoy.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Delivery Boy already exists",
      });
    }
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, salt);
    const deliveryBoy = new DeliveryBoy({
      ...deliverBoyData,
      password: hashedPassword,
    });
    await deliveryBoy.save();
    res.status(201).json({
      status: "success",
      data: deliveryBoy,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message || "Internal Server Error",
    });
  }
};
export const updateDeliveryBoy = async (req,res) => {
  const deliveryBoyId = req.params.id;
  const deliveryBoyData = req.body;
  try {
    if(req.body.car){
      const car = await Car.findById(req.body.car);
      if(!car){
        return res.status(404).json({
          status: "fail",
          message: "Car not found",
        });
      }
    }
    const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(deliveryBoyId, deliveryBoyData, { new: true });
    if (updatedDeliveryBoy) {
      res.status(200).json({
        status: "success",
        data: await transformationDeliveryBoy(updatedDeliveryBoy),
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Delivery Boy not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });}
}