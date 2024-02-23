import Product from "../models/productSchema.js";
import Supplier from "../models/supplierSchema.js";

export const transformationCustomer = (customer) => {
    return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        image: customer.image ?? '',
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        district: customer.district ?? '',
        governorate: customer.governorate ?? '',
        // totalRating: customer.totalRating ?? 0,
        averageRating: customer.averageRating ?? 0,
        status: customer.status ?? ''
    }
}

export const transformationProduct = (product) => {
    return {
        _id: product._id,
        title: product.title,
        desc: product.desc,
        weight: product.weight,
        subUnit: product.subUnit,
        category: product.category,
        images: product.images ?? []
    }
}

export const transformationSupplierProduct = async (supplierProduct) => {
    const product = await Product.findById(supplierProduct.productId);
    const supplier = await Supplier.findById(supplierProduct.supplierId);
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
        subUnit: product.subUnit,
        numberOfSubUnit: supplierProduct.numberOfSubUnit ?? null,
        category: product.category,
        supplierType: supplier.type,
        stock: supplierProduct.stock
    }
}
export const transformationRating = (rating) => {
    return {
        _id: rating._id,
        customerId: rating.customerId,
        supplierId: rating.supplierId,
        rate: rating.rate
    }
}