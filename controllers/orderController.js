import Fee from "../models/feesSchema.js";
import Order from "../models/orderSchema.js";
import PromoCode from "../models/promocodeSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";
import Offer from "../models/offerSchema.js";
import Product from "../models/productSchema.js";
import {
  transformationOrder,
  transformationSupplierProduct,
} from "../format/transformationObject.js";
import paginateResponse from "./../utils/paginationResponse.js";
import Car from "../models/carSchema.js";

export const getAllOrder = async (req, res) => {
  try {
    let orders;
    let query = {};
    if (req.query.date) {
      const orderDate = new Date(req.query.date);
      const nextDay = new Date(orderDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.orderDate = { $gte: orderDate, $lt: nextDay };
    } else if (req.query.month) {
      const year = new Date().getFullYear();
      const month = parseInt(req.query.month);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.orderDate = { $gte: startDate, $lte: endDate };
    }
    const totalOrders = await Order.countDocuments(query);
    orders = await Order.find(query);

    // Transformation
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        return await transformationOrder(order); // Transform each order
      })
    );

    // Pagination
    if (totalOrders === 0) {
      res.status(200).json({
        status: "success",
        message: "No orders found for the specified period",
        data: 0,
        totalOrders: totalOrders,
      });
    } else {
      paginateResponse(res, req.query, formattedOrders, totalOrders);
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const updateOrder = async (req, res, next) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }
    const supplier = await Supplier.findById(order.supplierId);
    if (!supplier) {
      return res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
    if (req.body.status === "complete") {
      const fee = await Fee.findOne(); // Assuming there is only one fee entry
      console.log('fee', fee);
      console.log('fee.amount', fee.amount/100);
      const blackHorseCommotion = order.totalPrice * (fee.amount / 100);
      console.log('blackHorseCommotion', blackHorseCommotion);
      supplier.wallet += blackHorseCommotion;
      await supplier.save();
    } else if (req.body.status === "cancelled") {
      if (req.headers["user_type"] === "supplier") {
        supplier.wallet += 5;
        await supplier.save();
      }

      for (const product of order.products) {
        const supplierProduct = await SupplierProduct.findOne({
          supplierId: supplier._id,
          productId: product.product,
        });
        supplierProduct.stock += product.quantity;
        await supplierProduct.save();
      }
      for (const offer of order.offers) {
        const offerData = await Offer.findById(offer.offer);
        offerData.stock += offer.quantity;
        await offerData.save();

        for (const iterProduct of offerData.products) {
          // increment offer's product
          const sp = await SupplierProduct.findOne({
            supplierId: supplier._id,
            productId: iterProduct.productId,
          });
          sp.stock += iterProduct.quantity * offer.quantity;
          await sp.save();
        }
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: await transformationOrder(updatedOrder),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getOrderByDelivery = async (deliveryId) => {
  // const deliveryId = req.params.deliveryId;
  try {
    const orders = await Order.find({ deliveryBoy: deliveryId });
    return await Promise.all(
      orders.map(async (order) => {
        return await transformationOrder(order); // Transform each order
      })
    );
    // res.status(200).json({
    //   status: "success",
    //   data:
    // });
  } catch (error) {
    return [];
    // res.status(500).json({
    //   status: "fail",
    //   message: error.message,
    // });
  }
};

export const createOrder = async (req, res) => {
  const orderData = req.body;
  const promoCode = req.body.promoCode;
  const customerId = req.body.customerId;
  const supplierId = req.body.supplierId;
  const products = req.body.products ?? []; // Array of products with { productId, quantity }
  const offers = req.body.offers ?? []; // Array of offers with { offerId, quantity }
  const carId = req.body.car;
  const totalPrice = req.body.totalPrice;
  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        status: "fail",
        message: "Car not found",
      });
    }
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(400).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
    // Check if the promo code is valid and associated with the supplier
    if (promoCode) {
      const existingPromoCode = await PromoCode.findOne({
        code: promoCode,
        supplierId,
      });
      if (!existingPromoCode) {
        return res.status(400).json({
          status: "fail",
          message: "Promo code not found or not associated with the supplier",
        });
      }
      // Check if the promo code has already been used by the customer
      if (existingPromoCode.customerId.includes(customerId)) {
        return res.status(400).json({
          status: "fail",
          message: "Promo code already used",
        });
      }
      // Add the customer ID to the list of customers who used the promo code
      existingPromoCode.customerId.push(customerId);
      await existingPromoCode.save();
    }

    for (const product of products) {
      const supplierProduct = await SupplierProduct.findOne({
        supplierId,
        productId: product.product,
      });
      console.log("supplierProduct:", supplierProduct);

      if (!supplierProduct || supplierProduct.stock < product.quantity) {
        const prod = await Product.findById(product.product);
        return res.status(400).json({
          status: "fail",
          message: `Product with title ${prod.title} is not available or out of stock`,
        });
      }
      if (!supplierProduct || supplierProduct.maxLimit < product.quantity) {
        const prod = await Product.findById(product.product);
        return res.status(400).json({
          status: "fail",
          message: `The maximum quantity allowed for purchasing ${prod.title} is ${supplierProduct.maxLimit}`,
        });
      }
    }

    for (const offer of offers) {
      const offerData = await Offer.findById(offer.offer);
      if (!offerData || offerData.stock < offer.quantity) {
        return res.status(400).json({
          status: "fail",
          message: `Offer with title ${offerData.title} is not available or out of stock`,
        });
      }
      if (!offerData || offerData.maxLimit < offer.quantity) {
        return res.status(400).json({
          status: "fail",
          message: `The maximum quantity allowed for purchasing ${offerData.title} is ${offerData.maxLimit}`,
        });
      }

      for (const iterProduct of offerData.products) {
        const sp = await SupplierProduct.findOne({
          supplierId,
          productId: iterProduct.productId,
        });
        if (!sp || sp.stock < iterProduct.quantity) {
          const prod = await Product.findById(iterProduct.productId);
          return res.status(400).json({
            status: "fail",
            message: `Product with title ${prod.title} in offer ${offerData.title} is not available or out of stock`,
          });
        }
      }
    }

    // Calculate the total price of the order including products and offers
    // let totalPrice = 0;
    for (const product of products) {
      const supplierProduct = await SupplierProduct.findOne({
        supplierId,
        productId: product.product,
      });
      // totalPrice += supplierProduct.price * product.quantity;
      supplierProduct.stock -= product.quantity;
      await supplierProduct.save();
    }
    for (const offer of offers) {
      const offerData = await Offer.findById(offer.offer);
      // totalPrice += offerData.price * offer.quantity;
      offerData.stock -= offer.quantity;
      await offerData.save();

      for (const iterProduct of offerData.products) {
        // decrement offer's product
        const sp = await SupplierProduct.findOne({
          supplierId,
          productId: iterProduct.productId,
        });
        sp.stock -= iterProduct.quantity * offer.quantity;
        await sp.save();
      }
    }

    // Create the order
    const newOrder = await Order.create(orderData);
    res.status(201).json({
      status: "success",
      data: await transformationOrder(newOrder),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getAllOrderByCustomerId = async (req, res) => {
  const customerId = req.params.id;
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
  const skip = (page - 1) * limit;

  try {
    const ordersCount = await Order.countDocuments({ customerId });
    const orders = await Order.find({ customerId }).skip(skip).limit(limit);
    if (orders) {
      const formattedOrders = await Promise.all(
        orders.map(async (order) => {
          return await transformationOrder(order); // Transform each order
        })
      );
      formattedOrders.reverse();
      const completeNotRatingOrder = formattedOrders.find(
        (order) =>
          order.status === "complete" && order.supplierRating === "notRating"
      );
      if (completeNotRatingOrder) {
        await Order.findOneAndUpdate(
          { _id: completeNotRatingOrder._id },
          { supplierRating: "ignore" },
          { new: true }
        );
      }
      paginateResponse(res, req.query, formattedOrders, ordersCount);
    } else {
      throw new Error("Could not find orders");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getAllOrderBySupplierId = async (req, res) => {
  const supplierId = req.params.id;
  const orderMonth = req.query.month;
  const startDate = new Date(new Date().getFullYear(), orderMonth - 1, 1); // First day of the month
  const endDate = new Date(new Date().getFullYear(), orderMonth, 0); // Last day of the month
  try {
    let orders;
    let totalOrders;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
    const query = orderMonth
      ? {
          supplierId: supplierId,
          orderDate: { $gte: startDate, $lte: endDate },
        }
      : { supplierId: supplierId };
    if (orderMonth) {
      orders = await Order.find(query);
      totalOrders = await Order.countDocuments(query);
      if (orders.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No orders found for the specified month",
          data: 0,
          totalOrders: totalOrders,
        });
      }
    } else {
      orders = await Order.find(query);
      totalOrders = await Order.countDocuments(query);
    }

    // Transform orders
    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        return await transformationOrder(order); // Transform each order
      })
    );

    paginateResponse(res, req.query, formattedOrders, totalOrders);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const totalOrderBySupplierId = async (req, res) => {
  const supplierId = req.params.id;
  const month = req.query.month;

  try {
    let orders;
    if (
      month &&
      !isNaN(month) &&
      parseInt(month) >= 1 &&
      parseInt(month) <= 12
    ) {
      const startDate = new Date(
        new Date().getFullYear(),
        parseInt(month) - 1,
        1
      );
      const endDate = new Date(new Date().getFullYear(), parseInt(month), 0);
      orders = await Order.find({
        supplierId,
        orderDate: { $gte: startDate, $lte: endDate },
      });

      if (orders && orders.length > 0) {
        res.status(200).json({
          status: "success",
          data: orders.length,
        });
      } else {
        res.status(200).json({
          status: "success",
          data: orders.length,
        });
      }
    } else {
      orders = await Order.find({ supplierId });

      if (orders && orders.length > 0) {
        res.status(200).json({
          status: "success",
          data: orders.length,
        });
      } else {
        throw new Error("No Orders found for the Supplier");
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getBestSeller = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      { $match: { products: { $exists: true, $ne: [] } } }, // Filter out null or empty products array
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      {
        $lookup: {
          from: "products", // Assuming the name of the product collection is "products"
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
    ]);

    if (bestSellers && bestSellers.length > 0) {
      const productIds = bestSellers.map((seller) => seller._id);
      const products = await SupplierProduct.find({
        productId: { $in: productIds },
      });
      console.log('products', products);
      
      const formattedProducts = await Promise.all(
        products.map(async (product) => {
          return await transformationSupplierProduct(product);
        })
      );
      res.status(200).json({
        status: "success",
        data: formattedProducts,
      });
    } else {
      // If no best sellers are found, respond with a message
      res.status(200).json({
        status: "success",
        message: "No best sellers found",
      });
    }
  } catch (error) {
    // If an error occurs, respond with a 500 status and error message
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const mostFrequentDistricts = async (req, res) => {
  try {
    const mostFrequentDistricts = await Order.aggregate([
      {
        $match: { status: "complete" },
      },
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    if (mostFrequentDistricts && mostFrequentDistricts.length > 0) {
      res.status(200).json({
        status: "success",
        data: mostFrequentDistricts,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "No delivered orders found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
