import Category from "../models/categorySchema.js";
import Offer from "../models/offerSchema.js";
import Product from "../models/productSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";
import SubUnit from "../models/subUnitSchema.js";

export const transformationCustomer = (customer) => {
  return {
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    image: customer.image ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    district: customer.district ?? "",
    governorate: customer.governorate ?? "",
    // totalRating: customer.totalRating ?? 0,
    averageRating: customer.averageRating ?? 0,
    status: customer.status ?? "",
  };
};
export const transformationProduct = (product) => {
  return {
    _id: product._id,
    title: product.title,
    desc: product.desc,
    weight: product.weight,
    subUnit: product.subUnit,
    category: product.category,
    images: product.images ?? [],
  };
};
export const transformationSupplierProduct = async (supplierProduct) => {
  const product = await Product.findById(supplierProduct.productId);
  const supplier = await Supplier.findById(supplierProduct.supplierId);
  const category = await Category.findOne({ _id: product.category });
  const subUnit = await SubUnit.findById(product.subUnit);
  console.log(subUnit);
  return {
    _id: product._id,
    title: product.title,
    price: supplierProduct.price,
    afterSale: supplierProduct.afterSale ?? null,
    weight: product.weight,
    images: product.images ?? [],
    maxLimit: supplierProduct.maxLimit,
    supplierId: supplier._id,
    desc: product.desc,
    unit: supplierProduct.unit ?? null,
    subUnit: subUnit.name,
    numberOfSubUnit: supplierProduct.numberOfSubUnit ?? null,
    category: category.name,
    supplierType: supplier.type,
    stock: supplierProduct.stock,
  };
};
export const transformationRating = (rating) => {
  return {
    _id: rating._id,
    customerId: rating.customerId,
    supplierId: rating.supplierId,
    rate: rating.rate,
  };
};
export const transformationOffer = async (offer) => {
  const transformedProducts = await Promise.all(
    offer.productId.map(async (productId) => {
      const supplierProduct = await SupplierProduct.findOne({ productId });
      if (!supplierProduct) return null;
      return transformationSupplierProduct(supplierProduct);
    })
  );
  console.log('offer',offer);
  return {
    _id: offer._id,
    supplierId: offer.supplierId,
    title: offer.title,
    image: offer.image,
    price: offer.price,
    quantity: offer.quantity,
    afterSale: offer.afterSale,
    maxLimit: offer.maxLimit,
    weight: offer.weight,
    unit: offer.unit,
    stock: offer.stock,
    products: transformedProducts.filter((product) => product !== null),
  };
}
export const transformationOrder= async (order) => {
  const supplier = await Supplier.findById(order.supplierId);
  console.log('products',order.products);
  
  const products = await Promise.all(
    order.products.map(async (product) => {
      const supplierProduct = await SupplierProduct.findOne({ productId:product.product });
      if (!supplierProduct) return null;
      return transformationSupplierProduct(supplierProduct);
    })
    );
    const offers = await Promise.all(
      order.offers.map(async (offerId)=>{
        const offer = await Offer.findById(offerId.offer);
        console.log('offerId',offerId);
        if (!offer) return null;
        return transformationOffer(offer);
      })
    )
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    supplierId: order.supplierId,
    supplierName: supplier.name,
    subTotalPrice: order.subTotalPrice,
    totalPrice: order.totalPrice,
    tax: order.tax,
    address: order.address,
    governorate: order.governorate,
    district: order.district,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhoneNumber: order.customerPhoneNumber,
    deliveryFees: order.deliveryFees,
    discount: order.discount,
    products: products.filter((product) => product !== null),
    orderDate: order.orderDate,
    deliveryDaysNumber: order.deliveryDaysNumber,
    status: order.status,
    supplierType: order.supplierType,
    orderWeight: order.orderWeight,
    maxOrderWeight: order.maxOrderWeight,
    minOrderPrice: order.minOrderPrice,
    offers: offers.filter((product) => product !== null),
    latitude: order.latitude,
    longitude: order.longitude,
    promoCode: order.promoCode,
    supplierRating: order.supplierRating,
  };
};

