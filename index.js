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
    if(deliveryId){
      IO.to(userSocketIdMap[deliveryId]).emit("order", await getOrderByDelivery(deliveryId));
    }
    else if(orderId && status){
      const order = await Order.findById(orderId);
      order.status = status;
      await order.save();
      // IO.to(userSocketIdMap[order.deliveryBoy]).emit("order", await getOrderByDelivery(order.deliveryBoy));
    }
  });
});

server.listen(port, async () => {
  await connectDB();
  // await pushNotification("بودي الطااير", "المشطشط عم اعمام الطايرين كلها", "", "", "", "", ["d_zpBsrUTqmhP8J_a60-82:APA91bFMkm6_41ei0ovi76DPv9X7uVBjOoPfEzvWT86_8wmTsH_nh1DOKaQ1LYtsH1Nfysmwb2rZ8ZVE_jy6jYXsQjLSJZhj3bYw_WQVUtXTKHQzce1hFkXIPJQdS2Y70X5-YoauLTZR"]);
  console.log(`listening on http://localhost:${port}`);
});
