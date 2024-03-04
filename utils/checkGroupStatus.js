import Group from "../models/groupSchema.js";
import Supplier from "../models/supplierSchema.js";


export const checkStatus = async () => {
  console.log('running cron job');
  try {
    const groups = await Group.find({ status: 'pending' });
    for (const group of groups) {
      const totalPrice = group.orders.reduce((acc, order) => acc + order.price, 0);
      const supplier = await Supplier.findById(group.supplierId);
      const minPrice = supplier.minOrderPrice;
      if (totalPrice >= minPrice) {
        group.status = 'complete';
        await group.save();
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
};