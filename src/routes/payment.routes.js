import { Router } from "express";
import {  createStripePaymentIntent } from "../controller/stripe/createPaymentIntent.js";



const routes = Router();

routes.post("/stripe/create-payment-intent-stripe", createStripePaymentIntent);




export default routes;
