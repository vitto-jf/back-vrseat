import dotenv from "dotenv";
import { getOrderFields, updateDataOrder } from "../../../repository/payment-orders/index.js";
import { createSales } from "../../../repository/sales/index.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../utils/utils.js";
import { processItemInventoryUser } from "../../playfabRequests/index.js";

dotenv.config();

export async function processOrder(req, res) {
  const { userToken, orderId, products } = req.body;
  const session = req.cookies["session"];
  const productsId = products.map((p) => p.id);

  try {
    const token = jwt.verify(session, JWT_SECRET);
    const userId = jwt.verify(userToken, JWT_SECRET);

    if (!token || !userId) {
      return res.status(401).json({ message: "Token inválido o no proporcionado" });
    }

    // Primero creamos la venta
    const resultCreateSale = await createSales(orderId, userId);

    if (!resultCreateSale.isSuccess) {
      return res.status(200).json({
        isSuccess: false,
        message: resultCreateSale.message || "Ocurrió un error al crear la venta",
      });
    }

    // Luego actualizamos la orden con el billingId
    const updateOrderResult = await updateDataOrder(orderId, userId, {
      billingId: resultCreateSale.billingId,
      isPaid: true,
      orderStatus: "finish",
    });

    if (!updateOrderResult.isSuccess) {
      return res.status(200).json({
        isSuccess: false,
        message: "Ocurrió un error al actualizar el estado de la orden",
      });
    }

    // Procesar el inventario del usuario en PlayFab
    const saveItemInventory = await processItemInventoryUser(productsId, token);

    if (!saveItemInventory.isSuccess) {
      return res.status(200).json({
        isSuccess: false,
        info: saveItemInventory,
        message: "Ocurrió un error al agregar el evento a tu perfil",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      message: "Orden actualizada y evento agregado correctamente",
    });
  } catch (error) {
    console.error("Error en processOrder:", error);
    return res.status(500).json({
      isSuccess: false,
      message: "Ocurrió un error interno en el servidor",
      error: error.message || error,
    });
  }
}
