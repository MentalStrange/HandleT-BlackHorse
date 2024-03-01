import Product from "../models/productSchema.js";
import Supplier from "../models/supplierSchema.js";
import Category from "../models/categorySchema.js";
import Offer from "../models/offerSchema.js";
import Order from "../models/orderSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import {
  transformationProduct,
  transformationSupplierProduct,
} from "../format/transformationObject.js";
import paginateResponse from "./../utils/paginationResponse.js";
import { searchProducts } from "../utils/search.js";

export const getProductBySupplier = async (req, res) => {
  const supplierId = req.params.id;
  const search = req.query.search;
  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        status: "fail",
        message: "Supplier not found",
      });
    }
    const supplierProductsCount = await SupplierProduct.countDocuments({
      supplierId,
    });
    const supplierProducts = await SupplierProduct.find({ supplierId })
    if (!supplierProducts || supplierProducts.length === 0) {
      throw new Error("No products found for this supplier");
    }
    // Transform each supplierProduct using the transformation function
    const products = await Promise.all(
      supplierProducts.map(async (supplierProduct) => {
        const transformedProduct = await transformationSupplierProduct(
          supplierProduct
        );
        return transformedProduct;
      })
    );
    const searchedProducts = searchProducts(products, search);    
    await paginateResponse(res, req.query, searchedProducts?await searchedProducts:products, supplierProductsCount);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getProductByCategory = async (req, res) => {
  const categoryId = req.params.id;
  const search = req.query.search;
  try {
    const category = await Category.findOne({_id: categoryId});
    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
    const supplierProducts = await SupplierProduct.find()
    const productsWithSupplier = supplierProducts.filter(
      (supplierProduct) => supplierProduct.supplierId
    );
    const transformedProducts = await Promise.all(
      productsWithSupplier.map(async (supplierProduct) => {
        return await transformationSupplierProduct(supplierProduct);
      })
    );
    const searchedProducts = searchProducts(transformedProducts, req.query.search);
    await paginateResponse(res, req.query, searchedProducts?await searchedProducts:transformedProducts, productsWithSupplier.length);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getAllProductAssignedToSupplier = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 6;
  const search = req.query.search || "";
  const filterCategory = req.query.category || "";
  const priceOrder = req.query.price;

  try {
    let baseQuery;
    if(priceOrder){
      baseQuery = SupplierProduct.find()
      .sort({ price: parseInt(priceOrder) })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    } else {
      baseQuery = SupplierProduct.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    }

    if (search) {
      baseQuery = baseQuery.find({
        $or: [
          { "productId.title": { $regex: search, $options: "i" } }, // Search by product title
        ],
      });
    }
    if (filterCategory) {
      baseQuery = baseQuery.find({ "productId.category.name": filterCategory }); // Filter by category name
    }
    const totalProducts = await SupplierProduct.countDocuments(baseQuery._conditions);
    const products = await baseQuery;

    // Formatting products
    const formattedProducts = await Promise.all(
      products.map((product) => transformationSupplierProduct(product))
    );

    // Paginate the formatted products
    await paginateResponse(res, req.query, formattedProducts, totalProducts, page, pageSize);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getAllProduct = async (req, res) => {
  const search = req.query.search || "";
  const filterCategory = req.query.category || "";

  try {
    let baseQuery = Product.find();
    if (search) {
      baseQuery = baseQuery.find({
        $or: [
          { "productId.title": { $regex: search, $options: "i" } }, // Search by product title
        ],
      });
    }
    if (filterCategory) {
      baseQuery = baseQuery.find({ "productId.category.name": filterCategory }); // Filter by category name
    }
    const totalProducts = await Product.countDocuments(baseQuery._conditions);
    const products = await baseQuery
    if (products.length > 0) {
      const formattedProducts = await Promise.all(
        products.map((product) => transformationProduct(product))
      );
      await paginateResponse(res, req.query, formattedProducts, totalProducts);
    } else {
      throw new Error("No products found");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getProductsByOfferId = async (req, res) => {
  const offerId = req.params.id;
  
  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        status: "fail",
        message: "Offer not found",
      })
    }
    let offerProducts = [];
    for (const prod of offer.products) {
      const sp = await SupplierProduct.findOne({ productId: prod.productId })
      offerProducts.push(await transformationSupplierProduct(sp, prod.quantity))
    }
    // const products = await Promise.all(
    //   offer.products.map(async (productId) => {
    //     const supplierProduct = await SupplierProduct.findOne({productId});
    //     if (!supplierProduct) {
    //       return null; // If supplierProduct not found, return null
    //     }
    //     console.log("supplierProduct:", supplierProduct);
    //     const transformedProduct = await transformationSupplierProduct(supplierProduct);
    //     return transformedProduct;
    //   })
    // );
    // const validProducts = products.filter((product) => product !== null);
    // paginateResponse(res,req.query,products,products.length)
    paginateResponse(res,req.query, offerProducts, offerProducts.length)
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
export const getProductByOrderId = async (req, res) => {
  const orderId = req.params.id;
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
  const pageSize = parseInt(req.query.pageSize) || 10; // Get the page size from the query parameters

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Paginate the products fetched from the order
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const supplierProducts = await SupplierProduct.find({
      productId: { $in: order.products.map((p) => p.product) },
    })
      .skip(startIndex)
      .limit(pageSize)
      .populate("productId")
      .populate("supplierId");

    const transformedProducts = await Promise.all(
      supplierProducts.map(async (supplierProduct) => {
        return await transformationSupplierProduct(supplierProduct);
      })
    );

    res.status(200).json({
      status: "success",
      data: transformedProducts,
      currentPage: page,
      totalPages: Math.ceil(order.products.length / pageSize),
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
