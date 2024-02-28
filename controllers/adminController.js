import Customer from "../models/customerSchema.js";
import DeliveryBoy from "../models/deliveryBoySchema.js";
import HomeSlideShow from "../models/homeSlideShowSchema.js";
import Supplier from "../models/supplierSchema.js";
import bcrypt from "bcrypt";
import Unit from "../models/unitSchema.js";
import Fee from "../models/feesSchema.js";
import Region from "../models/regionSchema.js";
import GroupExpireDate from "../models/groupExpireDate.js";
import { transformationUnit } from "../format/transformationObject.js";
const salt = 10;

export const deleteSupplier = async (req, res) => {
  const supplierId = req.params.id;
  try {
    if (supplierId) {
      await Supplier.deleteOne({ _id: supplierId });
      res.status(404).json({
        status: "success",
        data: null,
      });
    } else {
      throw new Error(`Supplier can not be founded`);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const deleteHomeSlideShow = async (req, res) => {
  const homeSlideShowId = req.params.id;
  try {
    if (homeSlideShowId) {
      await HomeSlideShow.findByIdAndDelete(homeSlideShowId);
      res.status(200).json({
        status: "success",
        data: null,
      });
    } else {
      throw new Error("Can not found this homeSlideShow");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getAllHomeSlideShow = async (req, res) => {
  try {
    const homeSlideShow = await HomeSlideShow.find();
    if (homeSlideShow) {
      res.status(200).json({
        status: "success",
        data: homeSlideShow,
      });
    } else {
      throw new Error("Could not find homeSlideShow");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const blockCustomer = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.status = "inactive";
      await customer.save();
      res.status(200).json({
        status: "success",
        data: customer,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Customer not found",
      });
    }
  } catch (error) {
    res.status.json({
      status: "fail",
      message: error.message,
    });
  }
};
export const blockSupplier = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const supplier = await Supplier.findById(supplierId);
    if (supplier) {
      supplier.status = "inactive";
      await supplier.save();
      res.status(200).json({
        status: "success",
        data: supplier,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
  } catch (error) {
    res.status.json({
      status: "fail",
      message: error.message,
    });
  }
};
export const createUnit = async (req,res) => {
  const unit = req.body;
  const existingUnit = await Unit.findOne({ name: unit.name });
  if (existingUnit) {
    throw new Error(`Unit or subunit '${unit.name}' already exists`);
  }
  const newUnit = new Unit(unit);
  await newUnit.save();
  res.status(201).json({
    status: "success",
    data: transformationUnit(newUnit),
  });
}
export const updateUnit = async (req,res) => {
  const unitId = req.params.id;
  const unitData = req.body;
  const existingUnit = await Unit.findOne({ name: unitData.name });
  if (existingUnit && existingUnit._id != unitId) {
    throw new Error(`Unit or subunit '${unitData.name}' already exists`);
  }
  const updatedUnit = await Unit.findByIdAndUpdate(
    unitId,
    unitData,
    { new: true }
  );
  if (updatedUnit) {
    res.status(200).json({
      status: "success",
      data: updatedUnit,
    });
  } else {
    throw new Error(`Unit not found`);
  }
}
export const deleteUnit = async (req, res) => {
  const unitId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      throw new Error('Invalid unit ID.');
    }
    const deletionResult = await Unit.deleteOne({ _id: unitId });
    if (deletionResult.deletedCount > 0) {
      res.status(200).json({
        status: 'success',
        message: 'Unit deleted successfully.',
      });
    } else {
      throw new Error('Unit not found.');
    }
  } catch (error) {
    res.status(error.statusCode || 404).json({
      status: 'fail',
      message: error.message || 'Not Found',
    });
  }
}
export const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    if (units) {
      res.status(200).json({
        status: "success",
        data: units,
      });
    } else {
      throw new Error("Could not find units");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const getFee = async (req, res) => {
  try {
    const fee = await Fee.find();
    res.status(200).json({
      status: "success",
      data:  { amount: fee[0].amount }
    })
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const createFee = async (req, res) => {
  try {
    await Fee.deleteMany();
    const newFee = new Fee({
      amount: req.body.amount
    });
    await newFee.save();
    res.status(201).json({
      status: "success",
      data: { amount: newFee.amount }
    })
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const createRegion = async (req, res) => {
  const region = req.body;
  const existingRegion = await Region.findOne({ name: region.name });
  try{if (existingRegion) {
    throw new Error(`Region or subregion '${region.name}' already exists`);
  }
  const newRegion = new Region(region);
  await newRegion.save();
  res.status(201).json({
    status: "success",
    data: newRegion,
  });}
  catch(error){
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}
export const createExpireDateGroup = async (req, res) => {
  const expireDateGroup = req.body;
  try {
    await GroupExpireDate.deleteMany();
    const newExpireDateGroup = new GroupExpireDate({
      date: expireDateGroup.date
    });
    await newExpireDateGroup.save();
    res.status(201).json({
      status: "success",
      data: newExpireDateGroup,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}