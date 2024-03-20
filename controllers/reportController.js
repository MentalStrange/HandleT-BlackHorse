import Order from "../models/orderSchema"
import SupplierProduct from "../models/supplierProductSchema";

export const rateOfCancellingOrder = async (req, res) => {
  const supplierId = req.params.id;
  const { startDate, endDate } = req.query;
  try {
    let filter = { supplierId: supplierId };
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalOrders = await Order.countDocuments(filter);
    const orderCancelled = await Order.countDocuments({ status: "cancelled", ...filter });

    if (totalOrders === 0) {
      return res.status(200).json({
        status: "success",
        message: "No orders found",
        data: 0,
      });
    } else {
      const cancellationRate = (orderCancelled / totalOrders) * 100;
      res.status(200).json({
        status: "success",
        message: "Cancellation Rate",
        data: cancellationRate,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const rateOfRemovedProduct = async (req, res) => {
  const supplierId = req.params.id;
  const { startDate, endDate } = req.query;
  try {
    let filter = { supplierId: supplierId };
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalProducts = await SupplierProduct.countDocuments(filter);
    const productRemoved = await SupplierProduct.countDocuments({ status: "inActive", ...filter });

    if (totalProducts === 0) {
      return res.status(200).json({
        status: "success",
        message: "No products found",
        data: 0,
      });
    } else {
      const removalRate = (productRemoved / totalProducts) * 100;
      res.status(200).json({
        status: "success",
        data: removalRate,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const rateOfTrashOrder = async (req, res) => {
  const supplierId = req.params.id;
  const { startDate, endDate } = req.query;
  try {
    let filter = { supplierId: supplierId };
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const totalOrders = await Order.countDocuments(filter);
    const orderTrash = await Order.countDocuments({ status: "trash", ...filter });

    if (totalOrders === 0) {
      return res.status(200).json({
        status: "success",
        message: "No orders found",
        data: 0,
      });
    } else {
      const trashRate = (orderTrash / totalOrders) * 100;
      res.status(200).json({
        status: "success",
        message: "Trash Rate",
        data: trashRate,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
