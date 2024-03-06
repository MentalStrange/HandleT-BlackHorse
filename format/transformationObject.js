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

export const transformationCustomer = async (customer) => {
const region = await Region.findById(customer.region);
  return {
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    image: customer.image ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    district: region.name ?? "",
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
export const transformationSupplierProduct = async (supplierProduct, quantity=1) => {
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
export const transformationOrder = async (order) => {  
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    subTotalPrice: order.subTotalPrice,
    totalPrice: order.totalPrice,
    tax: order.tax,
    address: order.address ?? null,
    district: order.district ?? null,
    type: order.type,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhoneNumber: order.customerPhoneNumber,
    deliveryFees: order.deliveryFees,
    discount: order.discount,
    products: order.products.map((product) => {
      return {
        _id: product.product,
        title: product.title,
        price: product.price,
        afterSale: product.afterSale,
        weight: product.weight,
        images: product.images?? [],
        maxLimit: product.maxLimit?? null,
        supplierId: product.supplierId,
        desc: product.desc,
        unit: product.unit,
        subUnit: product.subUnit,
        numberOfSubUnit: product.numberOfSubUnit,
        category: product.category,
        supplierType: product.supplierType,
        stock: product.stock,
        quantity: product.quantity
      }
    }),
    orderDate: order.orderDate,
    deliveryDaysNumber: order.deliveryDaysNumber,
    status: order.status,
    supplierType: order.supplierType,
    orderWeight: order.orderWeight,
    maxOrderWeight: order.maxOrderWeight,
    minOrderPrice: order.minOrderPrice,
    offers: order.offers.map((offer) => {
      return {
        _id: offer.offer,
        title: offer.title,
        image: offer.image ?? null,
        price: offer.price,
        afterSale: offer.afterSale,
        maxLimit: offer.maxLimit,
        weight: offer.weight,
        unit: offer.unit,
        stock: offer.stock,
        products: offer.products.map((product) => {
          return {
            productId: product.product,
            title: product.title,
            price: product.price,
            afterSale: product.afterSale,
            weight: product.weight,
            images: product.images?? [],
            maxLimit: product.maxLimit?? null,
            supplierId: product.supplierId,
            desc: product.desc,
            unit: product.unit,
            subUnit: product.subUnit,
            numberOfSubUnit: product.numberOfSubUnit,
            category: product.category,
            supplierType: product.supplierType,
            stock: product.stock,
            quantity: product.quantity
          }
        }),
        quantity: offer.quantity,
        desc: offer.desc,
      }
    }),
    latitude: order.latitude ?? null,
    longitude: order.longitude ?? null,
    promoCode: order.promoCode,
    supplierRating: order.supplierRating,
    deliveryBoy: order.deliveryBoy ?? null,
    car: {
      car: order.car._id,
      type: order.car.type,
      maxWeight: order.car.maxWeight,
      image: order.car.image ?? null,
      number: order.car.number
    },
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
    car: await transformationCar(car) ?? {}
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
    _id: supplier._id,
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
  }
}
export const transformationCar = async (car)=>{
  return {
    _id: car._id,
    image: car.image ?? null,
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
export const transformationRegion = async (region)=>{
  return {
    _id: region._id,
    name: region.name
  }
}
export const transformationGroup = async (group)=>{
  const supplier = await supplier.findById(group.supplierId);
  if(!supplier){
    return []
  }
  const transformSupplier = transformationSupplier(supplier);
}
