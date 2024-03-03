import { transformationGroup } from "../format/transformationObject.js";
import Customer from "../models/customerSchema.js";
import Group from "../models/groupSchema.js";
import Order from "../models/orderSchema.js";
import Supplier from "../models/supplierSchema.js";


export const createGroup = async (req,res) => {
  const regionId = req.body.region;
  const supplierId = req.body.supplierId;
  try {
    const group = await Group.findOne({region:regionId, supplierId:supplierId});
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
export const updateGroup = async (req,res) => {
  const groupId = req.params.id;
  const customerId = req.body.customerId;
  try {
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({
        status:"fail",
        data:{},
        message:"No Group Found By This Id"
      })
    }
    const customersExist = group.customerId;


  } catch (error) {
    
  }
}
export const joinGroup = async (req,res) => {
  const groupId = req.params.id;
  const orderId = req.body.order;
  try {
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({
        status:"fail",
        message:"Group Not Found"
      })
    }
    const order = await Order.findByIdAndUpdate(orderId,
      {group:groupId}
      );
    await order.save();
    const updatedGroup = group.customer.push(req.body.customerId);
    await updatedGroup.save();
    res.status(200).json({
      status:"success",
      data:transformationGroup(updateGroup)
    })
  } catch (error) {
    res.status(500).json({
      status:"fail",
      message:error.message
    })
  }
}