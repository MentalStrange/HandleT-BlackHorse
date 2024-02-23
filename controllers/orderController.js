import Category from "../models/categorySchema.js";
import Fee from "../models/feesSchema.js";
import Order from "../models/orderSchema.js";
import PromoCode from "../models/promocodeSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";

export const getAllOrder = async (req, res) => {
  let page = parseInt(req.query.page) || 1; // Current page, default to 1
  let limit = parseInt(req.query.limit) || 20; // Number of orders per page, default to 20

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
      const month = parseInt(req.query.month)
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.orderDate = { $gte: startDate, $lte: endDate };
    }
    const totalOrders = await Order.countDocuments(query);
    page = Math.max(1, page);
    limit = Math.max(1, limit);
    orders = await Order.find(query)
      .sort({ orderDate: 'desc' })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      status: "success",
      data: orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        ordersPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const createOrder = async (req, res) => {
  const orderData = req.body;
  const promoCode = req.body.promoCode;
  const customerId = req.body.customerId;
  const supplierId = req.body.supplierId;
  const products = req.body.products; // Array of products with { productId, quantity }
  const offers = req.body.offers; // Array of offers with { offerId, quantity }
  const totalPrice = req.body.totalPrice;

  try {
    // Check if the promo code is valid and associated with the supplier
    if (promoCode) {
      const existingPromoCode = await PromoCode.findOne({ code: promoCode, supplierId });
      if (!existingPromoCode) {
        return res.status(400).json({
          status: "fail",
          message: "Promo code not found or not associated with the supplier"
        });
      }
      // Check if the promo code has already been used by the customer
      if (existingPromoCode.customerId.includes(customerId)) {
        return res.status(400).json({
          status: "fail",
          message: "Promo code already used"
        });
      }
      // Add the customer ID to the list of customers who used the promo code
      existingPromoCode.customerId.push(customerId);
      await existingPromoCode.save();
    }

    // Calculate the total price of the order including products and offers
    // let totalPrice = 0;
    for (const product of products) {
      const supplierProduct = await SupplierProduct.findOne({ supplierId, productId: product.product });
      if (!supplierProduct || supplierProduct.stock < product.quantity) {
        const product = await Product.findById(product.product)
        const productTitle = product.title
        return res.status(400).json({
          status: "fail",
          message: `Product with ID ${productTitle} is not available or out of stock`
        });
      }
    }
    for(const product of products){
      const supplierProduct = await SupplierProduct.findOne({ supplierId, productId: product.product });
      // totalPrice += supplierProduct.price * product.quantity;
      supplierProduct.stock -= product.quantity;
      await supplierProduct.save();
    }
    for (const offer of offers) {
      const offerData = await Offer.findById(offer.offerId);
      for(const product of offerDate.products)
      if (!offerData || offerData.stock < offer.quantity) {
        return res.status(400).json({
          status: "fail",
          message: `Offer with ID ${offer.offerId} is not available or out of stock`
        }); 
      }
      // totalPrice += offerData.price * offer.quantity;
      offerData.stock -= offer.quantity;
      await offerData.save();
    }

    // Update the supplier's wallet with the total price of the order
    const fee = await Fee.findOne(); // Assuming there is only one fee entry
    const blackHorseCommotion = totalPrice * (fee.amount/100);
    const supplier = await Supplier.findById(supplierId);
    supplier.wallet += blackHorseCommotion;
    await supplier.save();

    // Create the order
    const newOrder = await Order.create(orderData);

    // Return the newly created order
    res.status(201).json({
      status: "success",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}

export const getAllOrderByCustomerId = async (req, res) => {
  const customerId = req.params.id;
  try {
    const orders = await Order.find({ customerId }).populate('supplierId', 'type');
    if (orders) {
      const formattedOrders = orders.map(order => ({
        ...order.toObject(),
        supplier: order.supplierId.type // Extracting the supplier type
      }));

      formattedOrders.reverse();
      const completeNotRatingOrder = formattedOrders.find(order => order.status === 'complete' && order.supplierRating === 'notRating');
      if (completeNotRatingOrder) {
        await Order.findOneAndUpdate({ _id: completeNotRatingOrder._id }, { supplierRating: 'ignore' }, { new: true });
      }

      res.status(200).json({
        status: "success",
        data: formattedOrders
      });
    } else {
      throw new Error('Could not find orders');
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
}
export const getAllOrderBySupplierId = async (req, res) => {
  const { id } = req.params; // Supplier ID from route parameters
  const orderMonth = req.query.month;

  try {
    let orders;
    if (orderMonth) {
      // If orderMonth is provided, filter orders by the specified month
      const startDate = new Date(new Date().getFullYear(), orderMonth - 1, 1); // First day of the month
      const endDate = new Date(new Date().getFullYear(), orderMonth, 0); // Last day of the month
      orders = await Order.find({ supplierId: id, orderDate: { $gte: startDate, $lte: endDate } });
      if (orders.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No orders found for the specified month",
          data: [],
        });
      }
    } else {
      // If orderMonth is not provided, get all orders for the supplier
      orders = await Order.find({ supplierId: id });
    }
    res.status(200).json({
      status: "success",
      data: orders,
    });
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
    if (month && !isNaN(month) && parseInt(month) >= 1 && parseInt(month) <= 12) {
      const startDate = new Date(new Date().getFullYear(), parseInt(month) - 1, 1);
      const endDate = new Date(new Date().getFullYear(), parseInt(month), 0);
      orders = await Order.find({ supplierId, orderDate: { $gte: startDate, $lte: endDate } });
      
      if (orders && orders.length > 0) {
        res.status(200).json({
          status: "success",
          data: orders.length
        });
      } else {
        res.status(200).json({
          status: "success",
          data: orders.length
        });
      }
    } else {
      orders = await Order.find({ supplierId });
      
      if (orders && orders.length > 0) {
        res.status(200).json({
          status: "success",
          data: orders.length
        });
      } else {
        throw new Error("No Orders found for the Supplier");
      }
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
}
export const getBestSeller = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      { $unwind: "$products" },
      { 
        $group: { 
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" }
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { 
        $lookup: {
          from: "products", // Assuming the name of the product collection is "products"
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      }
    ]);

    if (bestSellers && bestSellers.length > 0) {
      const products = await Promise.all(bestSellers.map(async (seller) => {
        const product = seller.product[0];
        const supplier = await Supplier.findOne({ products: product._id });
        const category = await Category.findById(product.category, 'name -_id'); // Retrieve category name
        return {
          ...product,
          category: category ? category.name : null, // Extract category name
          supplier: supplier ? supplier._id : null
        };
      }));

      res.status(200).json({
        status: "success",
        data: products.map(product => ({ ...product, category: product.category })),
      });
    } else {
      // If no best sellers are found, respond with a message
      res.status(200).json({
        status: "success",
        message: "No best sellers found"
      });
    }
  } catch (error) {
    // If an error occurs, respond with a 500 status and error message
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
}
export const mostFrequentDistricts = async (req, res) => {
  try {
    const mostFrequentDistricts = await Order.aggregate([
      {
        $match: { status: "complete" }
      },
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    if (mostFrequentDistricts && mostFrequentDistricts.length > 0) {
      res.status(200).json({
        status: "success",
        data: mostFrequentDistricts
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "No delivered orders found"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
};



