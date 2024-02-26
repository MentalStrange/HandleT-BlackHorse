import Customer from "../models/customerSchema.js";
import Group from "../models/groupSchema.js";


export const createGroup = async (req,res) => {
  const region = req.body.region;
  try {
    const group = await Group.findById(region)    
    if(group) {
      return res.status(400).json({
        status: "fail",
        message: "Group already exists",
      });
    }
    const newGroup = new Group({
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
export const getAllGroup = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = Customer.findById(customerId);
    const group = await Group.find({region:customer.region});
    if (group) {
      res.status(200).json({
        status: "success",
        data: group,
      });
    } else {
      throw new Error("Could not find Group");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const getAllGroupForCustomer = async (req,res) => {  
  const customerId = req.body.customerId;
  try {
    const customer = await Customer.findById(customerId);
    if(customer) {
      const groups = await Group.find({region:customer.region, status:"pending"});
      res.status(200).json({
        status: "success",
        data: groups
      });
    }else{
      res.status(404).json({
        status: "fail",
        message: "Customer not found",
      });
    }

  } catch (error) {
    
  }
}