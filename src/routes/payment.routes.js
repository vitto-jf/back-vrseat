import { Router } from "express";
import { createPaymentIntent } from "../controller/payment/stripe/create-payment-intent/index.js";


const routes = Router();

routes.post("/stripe/create-payment-intent-stripe", createPaymentIntent);
routes.post("/stripe/process-payment-intent-stripe", createPaymentIntent);
routes.post("/process-payment", createPaymentIntent);


export default routes;
