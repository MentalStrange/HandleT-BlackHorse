import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from "socket.io";
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import authRoute from './routes/auth.js';
import supplierRoute from './routes/supplier.js';
import customerRoute from './routes/customer.js';
import productRoute from './routes/product.js';
import adminRoute from './routes/admin.js';
import { getOrderByDelivery } from './controllers/orderController.js';
import Order from './models/orderSchema.js';
import { pushNotification } from './utils/pushNotification.js';
import { checkExpireGroup } from './utils/checkExpireGroup.js';
import {CronJob} from 'cron';
import DeliveryBoy from './models/deliveryBoySchema.js';
import Supplier from './models/supplierSchema.js';
import Customer from './models/customerSchema.js';

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const IO = new Server(server, { cors: { origin: "*" } });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});
const corsOption = {
  origin: true,
};

// connect to mongodb server
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL_DEVZAKI);
    // await mongoose.connect(process.env.MONGODB_URL_LOCAL)
    console.log("Mongoose connection successfully established");
  } catch (error) {
    console.log('Mongoose connection error: ' + error);
  }
};

// check the status of the group

const cronJobStart = new CronJob('0 0 * * *', checkExpireGroup);
// cronJobStart.start();


app.use(express.static(path.join(__dirname, 'upload')));
app.use(cors(corsOption));
app.use(express.json());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/supplier", supplierRoute);
app.use("/api/v1/customer", customerRoute);
app.use("/api/v1/product", productRoute);  // Include productRoute
app.use("/api/v1/admin", adminRoute);

app.get('/', async (req, res) => {
  res.send("<center><h1>Welcome to BlackHorse Company</h1></center>");
});

const userSocketIdMap = [];
IO.use((socket, next) => {
  if (socket.handshake.query) {
    let socketId = socket.handshake.query.socketId;
    socket.socketUser = socketId;
    userSocketIdMap[socket.socketUser] = socket.id;
    next();
  }
});

IO.on("connection", (socket) => {
  console.log(userSocketIdMap);
  socket.join(socket.socketUser);

  socket.on('disconnect', () => {
    delete userSocketIdMap[socket.socketUser];
    console.log("deleted:", userSocketIdMap);
  });

  socket.on("order", async (data) => {
    let orderId = data.orderId;
    let status = data.status;
    let deliveryId = data.deliveryId;
    if(deliveryId && orderId && status){
      const delivery = await DeliveryBoy.findById(deliveryId);
      const order = await Order.findById(orderId);
      order.status = status;
      order.deliveryBoy = deliveryId;
      await order.save();
      if(order.status === 'willBeDelivered'){
        const customer = Customer.findById(order.customerId);
        await pushNotification("لديك طلب جديد", `لديك اوردر جديد بوزن ${order.orderWeight/1000} كيلو ينتظر موافقتك`, null, null, null, deliveryId, delivery.deviceToken);
        await pushNotification("تم الموافقة ع الطلب", `تم اسناد الاوردر الخاص بك برقم ${order.orderNumber} الي عامل التوصيل`, null, order.customerId, null, null, customer.deviceToken);
      }
      IO.to(userSocketIdMap[deliveryId]).emit("order", await getOrderByDelivery(deliveryId));
    }
    else if(orderId && status){
      const order = await Order.findById(orderId);
      order.status = status;
      await order.save();
      if(order.status === 'delivery'){
        const supplier = await Supplier.findById(order.supplierId);
        const customer = Customer.findById(order.customerId);
        await pushNotification("تم الموافقة!", `قام عامل التوصيل بالموافقة ع توصيل الاوردر رقم ${order.orderNumber}`, null, null, order.supplierId, null, supplier.deviceToken);
        await pushNotification("وافق عامل التوصيل", `تم الموافقة ع توصيل الاوردر برقم ${order.orderNumber}`, null, order.customerId, null, null, customer.deviceToken);
      }
      // IO.to(userSocketIdMap[order.deliveryBoy]).emit("order", await getOrderByDelivery(order.deliveryBoy));
    }
    else if(deliveryId){
      IO.to(userSocketIdMap[deliveryId]).emit("order", await getOrderByDelivery(deliveryId));
    }
  });
});

server.listen(port, async () => {
  await connectDB();
  // await pushNotification("بودي الطااير", "المشطشط عم اعمام الطايرين كلها", "", "", "", "", ["fQa6phIPTxK9bf1GrAnJHL:APA91bGnB71jOWb3F4qqF3I0xhIAyutZSXi2WRnrtGgITR9Cow_DWA7o9_OzcYT8r6CJJcBzCzajkBhBLnAfnPN_z96rK8BB18grBjtoYj8kE5nmoN6tAQ04KHnbpwssIGUV2Rvn7jfo"]) //, "e2-Rwm4tQCOWQCxv3koLeY:APA91bGJJGuBFiMWF_JN51spBC_2mj9ZiM9XzQrnYGdQtEI47EmIbX1E0v1i4UvozE0T3Yojt3IL8A-U6KJmczrJUUx1gnY2ARbrw7nVDmWtKzGtfrrk-lFWKbt84I6OMvTbUKSS_swr"]);
  console.log(`listening on http://localhost:${port}`);
});
