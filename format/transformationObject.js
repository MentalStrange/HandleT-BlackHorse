import Category from "../models/categorySchema.js";
import Offer from "../models/offerSchema.js";
import Product from "../models/productSchema.js";
import SupplierProduct from "../models/supplierProductSchema.js";
import Supplier from "../models/supplierSchema.js";
import SubUnit from "../models/subUnitSchema.js";
import Car from "../models/carSchema.js";
import Unit from "../models/unitSchema.js";
import Region from "../models/regionSchema.js";
import Customer from "../models/customerSchema.js";

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
    averageRating: customer.averageRating ?? 0,
    status: customer.status ?? "",
  };
};
export const transformationProduct = async (product) => {
  const category = await Category.findOne({ _id: product.category });
  return {
    _id: product._id,
    title: product.title,
    desc: product.desc,
    weight: product.weight,
    subUnit: product.subUnit,
    category: category.name,
    images: product.images ?? [],
  };
};
export const transformationSupplierProduct = async (supplierProduct, quantity=1, unitWeight) => {
  const product = await Product.findById(supplierProduct.productId);
  const supplier = await Supplier.findById(supplierProduct.supplierId);
  const category = await Category.findOne({ _id: product.category });
  const subUnit = await SubUnit.findById(supplierProduct.subUnit);
  const unit =  supplierProduct.unit !== undefined ? await Unit.findById(supplierProduct.unit) : null ;
  
  if(!supplier){
    throw new Error('supplier Not Found')
  }
  if(!product){
    throw new Error('product Not Found')
  }
  if(!category){
    throw new Error('category Not Found')
  }
  if(!subUnit){
    throw new Error('subUnit Not Found')
  }
  return {
    _id: product._id,
    title: product.title,
    price: supplierProduct.price,
    afterSale: supplierProduct.afterSale ?? null,
    weight: supplierProduct.productWeight,
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
export const transformationOffer = async (offer, quantity=1) => {
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
    image: offer.image ?? null,
    price: offer.price,
    afterSale: offer.afterSale,
    maxLimit: offer.maxLimit,
    weight: offer.weight,
    unit: offer.unit,
    stock: offer.stock,
    products: offer.products, // transformedProducts.filter((product) => product !== null),
    quantity: quantity,
    desc: offer.desc,
  };
}
export const transformationOrder= async (order) => {  
  const supplier = await Supplier.findById(order.supplierId);
  if(!supplier) throw new Error('supplier Not Found');

  const products = await Promise.all(
    order.products.map(async (product) => {
      const supplierProduct = await SupplierProduct.findOne({ productId:product.product });
      if (!supplierProduct)  throw new Error('supplierProduct Not Found');
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

  const customer = await Customer.findById(order.customerId);
  const car = await Car.findById(order.car);
  if(!car) throw new Error('car Not Found');
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
    customerId: customer._id,
    customerName: customer.name,
    customerPhoneNumber: customer.phone,
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
    offers: offers.filter((offer) => offer !== null),
    latitude: order.latitude,
    longitude: order.longitude,
    promoCode: order.promoCode,
    supplierRating: order.supplierRating,
    deliveryBoy: order.deliveryBoy ?? "",
    car:car ??{},
  };
};
export const transformationDeliveryBoy = async (deliverBoy) => {
  const car = await Car.findById(deliverBoy.car);
  const region = await Region.findById(deliverBoy.region);
  return{
    _id: deliverBoy._id,
    name: deliverBoy.name,
    email: deliverBoy.email,
    nationalId: deliverBoy.nationalId,
    image: deliverBoy.image ?? null,
    phone: deliverBoy.phone,
    region: region.name ?? "",
    access_token: deliverBoy.access_token,
    car: transformationCar(car) ?? {}
  }
}
export const transformationSupplier = async (supplier) => {
  let deliveryRegionName = [];
  if(supplier.deliveryRegion){
      deliveryRegionName = await Promise.all(
      supplier.deliveryRegion.map(async (regionId)=>{
        const region = await Region.findById(regionId);
        return region.name;
      })
    );
  }
  return{
    name: supplier.name,
    email: supplier.email,
    wallet: supplier.wallet,
    nationalId: supplier.nationalId,
    phoneNumber: supplier.phoneNumber,
    minOrderPrice: supplier.minOrderPrice ?? "",
    deliveryRegion: deliveryRegionName ?? [],
    workingDays: supplier.workingDays ?? "",
    workingHours: supplier.workingHours ?? "",
    deliveryDaysNumber: supplier.deliveryDaysNumber ?? "",
    type: supplier.type,
    image: supplier.image ?? null,
    status: supplier.status,
    placeImage: supplier.placeImage,
    rating: supplier.averageRating ?? 0,
    desc: supplier.desc ?? "",
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
export const transformationPromoCode = async (promoCode)=>{
  return {
    _id: promoCode._id,
    code: promoCode.code,
    discount: promoCode.discount,
    expiryDate: promoCode.expiryDate,
    numOfUsage: promoCode.numOfUsage
  }
}
export const transformationGroup = async (group)=>{
  const supplier = await supplier.findById(group.supplierId);
  if(!supplier){
    return []
  }
  const transformSupplier = transformationSupplier(supplier);
}
