import Product from "../models/productSchema.js";
import Supplier from "../models/supplierSchema.js";
import Category from "../models/categorySchema.js";
import Offer from "../models/offerSchema.js";
import Order from "../models/orderSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";

export const getProductBySupplier = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const supplierProducts = await SupplierProduct.find({ supplierId }).populate('productId');
    if (!supplierProducts || supplierProducts.length === 0) {
      throw new Error('No products found for this supplier');
    }
    const products = supplierProducts.map(({ productId, price, stock }) => ({
      _id: productId._id,
      name: productId.name,
      description: productId.description,
      category: productId.category,
      price,
      stock
    }));

    res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


export const getProductByCategory = async (req, res) => {
  try {
    if (!req.params.categoryId) {
      return res.status(400).json({
        status: "fail",
        message: "Category ID is required"
      });
    }
    const products = await Product.find({ category: req.params.categoryId });
    if (products && products.length > 0) {
      const formattedProducts = await Promise.all(products.map(async product => {
        const supplierId = await Supplier.findOne({ products: product._id }, '_id');
        const category = await Category.findById(product.category);
        const categoryName = category ? category.name : 'UnCategorized';
        if (supplierId) {
          return {
            ...product.toObject(),
            category: categoryName,
            supplier: supplierId._id,
          };
        } else {
          return null; // Don't include products without a supplier
        }
      }));
      
      // Filter out products that don't have a supplier
      const filteredProducts = formattedProducts.filter(product => product !== null);

      res.status(200).json({
        status: "success",
        data: filteredProducts
      });
    } else {
      throw new Error('No products found for the given category');
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
};

export const getAllProductAssignedToSupplier = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const search = req.query.search || '';
  const filterCategory = req.query.category || '';

  try {
    let baseQuery = SupplierProduct.find()
      .populate('category')
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (search) {
      baseQuery = baseQuery.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (filterCategory) {
      baseQuery = baseQuery.find({ 'category.name': filterCategory });
    }

    const totalProducts = await SupplierProduct.countDocuments(baseQuery._conditions);
    const products = await baseQuery;

    if (products.length > 0) {
      const formattedProducts = await Promise.all(products.map(async product => {
        const supplierId = await Supplier.findOne({ products: product._id }, '_id');
        const categoryName = product.category ? product.category.name : 'UnCategorized';
        if (supplierId) {
          return {
            ...product.toObject(),
            category: categoryName,
            supplier: supplierId._id,
          };
        } else {
          return null; // Don't include products without a supplier
        }
      }));
      const filteredProducts = formattedProducts.filter(product => product !== null);

      res.status(200).json({
        status: "success",
        data: {
          products: filteredProducts,
          totalProducts: totalProducts, // Use totalProducts obtained from the query
          currentPage: page,
          totalPages: Math.ceil(totalProducts / pageSize), // Update totalPages calculation
        },
      });
    } else {
      throw new Error("No products found");
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};
export const getAllProduct = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const search = req.query.search || '';
  const filterCategory = req.query.category || '';

  try {
    let baseQuery = Product.find()
      .populate('category')
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (search) {
      baseQuery = baseQuery.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (filterCategory) {
      baseQuery = baseQuery.find({ 'category.name': filterCategory });
    }

    const totalProducts = await Product.countDocuments(baseQuery._conditions);
    const products = await baseQuery;

    if (products.length > 0) {
      const formattedProducts = await Promise.all(products.map(async product => {
        const supplier = await Supplier.findOne({ products: product._id });

        // If a supplier is found, include supplier information
        if (supplier) {
          return {
            ...product.toObject(),
            supplier: {
              _id: supplier._id,
              name: supplier.name,
              // Include any other relevant supplier information
            }
          };
        } else {
          // If no supplier is found, include a null supplier
          return {
            ...product.toObject(),
            supplier: null
          };
        }
      }));

      res.status(200).json({
        status: "success",
        data: {
          products: formattedProducts,
          totalProducts: totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / pageSize),
        },
      });
    } else {
      throw new Error("No products found");
    }
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};


export const getProductsByOfferId = async (req, res) => {
  const offerId = req.params.id;
  try {
    const offers = await Offer.findById(offerId);
    if (!offers) {
      throw new Error('Offer not found');
    }
    const products = await Promise.all(offers.productId.map(async product => {
      const productData = await Product.findById(product);
      if (!productData) {
        return null; // If product not found, return null
      }
      // Fetch supplier for the product
      const supplier = await Supplier.findOne({ products: product._id }, '_id');
      const category = await Category.findById(productData.category);
      return {
        ...productData.toObject(),
        supplier: supplier ? supplier._id : null,
        category: category.name,
      };
    }));

    res.status(200).json({
      status: 'success',
      data: products.filter(product => product !== null), // Remove null entries
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};
export const getProductByOrderId = async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const products = await Promise.all(order.products.map(async product => {
      const productData = await Product.findById(product.product);
      if (!productData) {
        return null; // If product not found, return null
      }
      const supplier = await Supplier.findOne({ products: product.product }, '_id');
      const category = await Category.findById(productData.category);
      console.log('category', category);
      
      return {
        ...productData.toObject(),
        supplier: supplier ? supplier._id : null,
        category: category.name
      };
    }));

    res.status(200).json({
      status: 'success',
      data: products.filter(product => product !== null), // Remove null entries
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

