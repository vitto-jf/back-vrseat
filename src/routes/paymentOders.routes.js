import { Router } from "express";
import { createPayOrder } from "../controller/payment-orders/generate-order/index.js";
import { getOrderById } from "../controller/payment-orders/get-order/index.js";

import { statusOrder } from "../controller/payment-orders/update-status/index.js";
import { updateOrder } from "../controller/payment-orders/update-order/index.js";
import { processOrder } from "../controller/payment-orders/process-order/index.js";

const routes = Router();

routes.post("/create-pay-order", createPayOrder);

routes.get("/get-order", getOrderById);
routes.post("/update-status-order",statusOrder)
routes.post("/update-order",updateOrder)
routes.post("/process-order",processOrder)
export default routes;
