import { transformationGroup } from "../format/transformationObject.js";
import Customer from "../models/customerSchema.js";
import Group from "../models/groupSchema.js";
import Order from "../models/orderSchema.js";
import Supplier from "../models/supplierSchema.js";
import { updateOrderForGroup } from "../utils/updateOrderForGroup.js";

export const createGroup = async (req, res) => {
  const regionId = req.body.region;
  const supplierId = req.body.supplierId;
  try {
    const group = await Group.findOne({
      region: regionId,
      supplierId: supplierId,
    });
    if (group) {
      return res.status(400).json({
        status: "fail",
        message: "Group already exists",
      });
    }
    const newGroup = new Group({
      ...req.body,
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
};
export const getAllGroup = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = Customer.findById(customerId);
    const group = await Group.find({ region: customer.region });
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
};
export const getAllGroupForCustomer = async (req, res) => {
  const customerId = req.body.customerId;
  const region = req.body.region;
  try {
    const customer = await Customer.findById(customerId);
    if (customer) {
      const groups = await Group.find({ region: region, status: "pending" });
      res.status(200).json({
        status: "success",
        data: groups,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Customer not found",
      });
    }
  } catch (error) {}
};
export const updateGroup = async (req, res) => {
  const groupId = req.params.id;
  const groupStatus = req.body.status;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        status: "fail",
        data: {},
        message: "No Group Found By This Id",
      });
    }
    const orders = await Order.find({ group: groupId });
    console.log('orders', orders);
    
    if (groupStatus === "accepted") {      
      group.status = "accepted";
      await Promise.all(
        orders.map(async (order) => {
          await updateOrderForGroup(order._id, "complete" );
        })
      );
    }
    if (groupStatus === "canceled") {
      group.status = "canceled";
      await Promise.all(
        orders.map(async (order) => {
          await updateOrderForGroup(order._id, "canceled" );
        })
      );
    }
    await group.save();
    res.status(200).json({
      status: "success",
      message: "Group updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const joinGroup = async (req, res) => {
  const groupId = req.params.id;
  const orderId = req.body.order;
  const customerId = req.body.customerId;
  try {
    const customer = await Customer.findById(customerId);
    const order = await Order.findByIdAndUpdate(orderId, { group: groupId });
    if (!customer) {
      return res.status(404).json({
        status: "fail",
        data: [],
        message: "Customer Not Found",
      });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        status: "fail",
        message: "Group Not Found",
      });
    }
    const supplier = await Supplier.findById(group.supplierId);
    if (group.customer.includes(customerId)) {
      return res.status(403).json({
        status: "fail",
        message: "Customer Already Joined",
      });
    }
    if (!order.supplierId.equals(group.supplierId)) {
      return res.status(403).json({
        status: "fail",
        message: "Can Not Join To This Group As Supplier Is Different",
      });
    }
    await order.save();
    let totalPrice = order.totalPrice;
    group.customer.push(customerId);
    group.totalPrice += totalPrice;
    // const orders = await Order.find({group:groupId});
    if (group.totalPrice >= supplier.minOrderPrice) {
      group.status = "complete";
      // await Promise.all(
      //   orders.map(async (order) => {
      //     order.status = "complete";
      //     order.save();
      //   })
      // )
    }
    await group.save();
    // const updateGroup = await transformationGroup(group);
    res.status(200).json({
      status: "success",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
// will be for supplier to accept or reject it....
export const getAllGroupComplete = async (req, res) => {
  try {
    const group = await Group.find({ status: "complete" });
    if (group) {
      return res.status(200).json({
        status: "success",
        data: group, // transformation(group);
      });
    } else {
      return res.status(200).json({
        status: "fail",
        data: [],
        message: "No Group Completed Founded",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
// will be for delivery boy to see the order that should be delivered
export const getAllGroupDelivery = async (req, res) => {
  const deliveryBoy = req.params.id;
  try {
    const group = await Group.findById(deliveryBoy);
    if (group) {
      return res.status(200).json({
        status: "success",
        data: group, // transformation(group);
      });
    } else {
      return res.status(200).json({
        status: "fail",
        data: [],
        message: "No Group Founded",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
// will be for customer to see the all group from the same region for the same supplier.
export const getAllGroupPending = async (req, res) => {
  const region = req.body.region;
  const supplierId = req.body.supplierId;
  try {
    const group = await Group.find({
      status: "pending",
      region: region,
      supplierId: supplierId,
    });
    if (group) {
      return res.status(200).json({
        status: "success",
        data: group, // transformation(group);
      });
    } else {
      return res.status(200).json({
        status: "fail",
        data: [],
        message: "No Group Pending Founded",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
