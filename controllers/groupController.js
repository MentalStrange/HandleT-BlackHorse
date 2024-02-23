import RegionGroup from "../models/regionGroupSchema.js";

export const createRegionGroup = (req,res) => {
  const customerId = req.params.id;
  const {region} = req.body;
  try {
    const group = RegionGroup.find({name:region})
    if(group) {
      return res.status(400).json({
        status: "fail",
        message: "Group already exists",
      });
    }
    const newGroup = new RegionGroup({
      ...req.body
    });
    newGroup.save();
    res.status(201).json({
      status: "success",
      data: newGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "fail",
      message: error.message || "Internal Server Error",
    });
  }
}
export const getAllRegionGroup = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = Customer.findById(customerId);
    const regionGroup = await RegionGroup.find({region:customer.region});
    if (regionGroup) {
      res.status(200).json({
        status: "success",
        data: regionGroup,
      });
    } else {
      throw new Error("Could not find regionGroup");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
