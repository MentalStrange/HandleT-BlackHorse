import product from "../routes/product.js";

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