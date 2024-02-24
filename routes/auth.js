import express from 'express';
import { customerLogin, deliveryBoyLogin, supplierLogin } from '../auth/login.js';
import { createCustomer } from '../auth/signup.js';
import { customerProfile } from '../auth/userProfile.js';
import { sendResetCodeCustomer, resetPasswordCustomer } from '../auth/sendResetCode.js';
import validateEmail from '../middlewares/emailMiddleware.js';
import { authenticate } from '../middlewares/authorizationMiddleware.js';

const Router = express.Router();


Router.post('/supplier', validateEmail, supplierLogin);
Router.post('/customer', validateEmail, customerLogin);
Router.post('/deliveryBoy', validateEmail, deliveryBoyLogin);

Router.post('/signup/customer',validateEmail, createCustomer);
Router.get('/userProfile/customer', customerProfile);
Router.post('/sendResetCode/customer', validateEmail, sendResetCodeCustomer);
Router.post('/resetPassword/customer', validateEmail, resetPasswordCustomer);

export default Router;