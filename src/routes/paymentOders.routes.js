import { Router } from "express";
import { createPayOrder } from "../controller/payment-orders/generate-order/index.js";
import { getOrderById } from "../controller/payment-orders/get-order/index.js";

const routes = Router();

routes.post("/create-pay-order", createPayOrder);
routes.get("/get-order", getOrderById);

export default routes;
