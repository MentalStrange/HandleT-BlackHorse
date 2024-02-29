import Category from "../models/categorySchema.js";
import Offer from "../models/offerSchema.js";
import Product from "../models/productSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";
import SubUnit from "../models/subUnitSchema.js";
import Car from "../models/carSchema.js";
import Unit from "../models/unitSchema.js";
import Region from "../models/regionSchema.js";

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
export const transformationSupplierProduct = async (supplierProduct, quantity=0) => {
  const product = await Product.findById(supplierProduct.productId);
  const supplier = await Supplier.findById(supplierProduct.supplierId);
  const category = await Category.findOne({ _id: product.category });
  const subUnit = await SubUnit.findById(supplierProduct.subUnit);
  const unit =  supplierProduct.unit !== undefined ? await Unit.findById(supplierProduct.unit) : null ;
  return {
    _id: product._id,
    title: product.title,
    price: supplierProduct.price,
    afterSale: supplierProduct.afterSale ?? null,
    weight: product.weight,
    images: product.images ?? [],
    maxLimit: supplierProduct.maxLimit ?? null,
    supplierId: supplier._id,
    desc: product.desc,
    unit: unit ? unit.name : null,
    subUnit: subUnit.name,
    numberOfSubUnit: unit ? unit.maxNumber : null,
    category: category.name,
    supplierType: supplier.type,
    stock: supplierProduct.stock,
    quantity: quantity
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
export const transformationOffer = async (offer, quantity=0) => {
  const transformedProducts = await Promise.all(
    offer.products.map(async (productId) => {
      const supplierProduct = await SupplierProduct.findOne({ productId });
      if (!supplierProduct) return null;
      return transformationSupplierProduct(supplierProduct);
    })
  );
  return {
    _id: offer._id,
    supplierId: offer.supplierId,
    title: offer.title,
    image: offer.image,
    price: offer.price,
    afterSale: offer.afterSale,
    maxLimit: offer.maxLimit,
    weight: offer.weight,
    unit: offer.unit,
    stock: offer.stock,
    products: offer.products, // transformedProducts.filter((product) => product !== null),
    quantity: quantity
  };
}
export const transformationOrder= async (order) => {
  
  const supplier = await Supplier.findById(order.supplierId);
  const products = await Promise.all(
    order.products.map(async (product) => {
      const supplierProduct = await SupplierProduct.findOne({ productId:product.product });
      if (!supplierProduct) return null;
      return transformationSupplierProduct(supplierProduct, product.quantity);
    })
  );
  const offers = await Promise.all(
    order.offers.map(async (offerId)=>{
      const offer = await Offer.findById(offerId.offer);
      if (!offer) return null;
      return transformationOffer(offer, offer.quantity);
    })
  );
  const car = await Car.findById(order.car);
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
    supplierType: supplier.type,
    orderWeight: order.orderWeight,
    maxOrderWeight: order.maxOrderWeight,
    minOrderPrice: order.minOrderPrice,
    offers: offers.filter((product) => product !== null),
    latitude: order.latitude,
    longitude: order.longitude,
    promoCode: order.promoCode,
    supplierRating: order.supplierRating,
    deliveryBoy: order.deliveryBoy ?? "",
    car:car ??"",
  };
};
export const transformationDeliveryBoy = async (deliverBoy) => {
  const car = await Car.findById(deliverBoy.car);
  return{
    _id: deliverBoy._id,
    name: deliverBoy.name,
    email: deliverBoy.email,
    password: deliverBoy.password ?? "",
    image: deliverBoy.image,
    phoneNumber: deliverBoy.phone,
    deliveryDistrict: deliverBoy.region ?? "",
    access_token: deliverBoy.access_token,
    address: deliverBoy.address ?? '',
    car:transformationCar(car) ?? ""
  }
  
}
export const transformationSupplier = async (supplier) => {
  const deliveryRegion = await Promise.all(
    supplier.deliveryRegion.map(async (region) => {
      const regionName = await Region.findById(region);
      if(!regionName){
        throw new Error(`Region not with id ${region} found`);
      }
      if (!regionName) return null;
      return regionName.name;
    })
  )
  return{
    name: supplier.name,
    email: supplier.email,
    password: supplier.password,
    nationalId: supplier.nationalId,
    phoneNumber: supplier.phoneNumber,
    minOrderPrice: supplier.minOrderPrice ?? "",
    deliveryRegion: deliveryRegion ?? "",
    workingDays: supplier.workingDays ?? "",
    workingHours: supplier.workingHours ?? "",
    deliveryDaysNumber: supplier.deliveryDaysNumber ?? "",
    type: supplier.type,
    image: supplier.image,
    placeImages: supplier.placeImage,
    rating: supplier.averageRating ?? 0,
    desc: supplier.desc ?? null,
    _id: supplier._id
  }
}
export const transformationCar = (car)=>{
  return {
    _id: car._id,
    image: car.image,
    type: car.type,
    number: car.number ?? '',
    maxWeight: car.maxWeight
  }
}
export const transformationUnit = (unit)=>{
  return {
    _id: unit._id,
    name: unit.name,
    number: unit.maxNumber,
  }
}
export const transformationPromoCode = (promoCode)=>{
  return {
    _id: promoCode._id,
    code: promoCode.code,
    discountPercentage: promoCode.discount,
  }
}
