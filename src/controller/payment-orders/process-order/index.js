import dotenv from "dotenv";
import { updateDataOrder } from "../../../repository/payment-orders/index.js";
import { createSales } from "../../../repository/sales/index.js";

dotenv.config();

export async function processOrder(req, res) {
  const body = req.body;
  try {
    const result = await updateDataOrder(body.orderId, body.userId, {
      isPaid: true,
      orderStatus: "finish",
    });

    console.log(result)
    if (!result) {
      return res.status(200).send({
        isSuccess: false,
        message: "Ocurrio un error al actualizar el estatus de la orden",
      });
    }


    const resultCreateSale = await createSales(body.orderId, body.userId);
    
    if (!resultCreateSale.isSuccess) {
      return res.status(200).send({
        isSuccess: false,
        message: "Ocurrio un error al crear la venta",
      });
    }
    console.log(resultCreateSale)

    const resUpdate = await updateDataOrder(body.orderId, body.userId, {
        billingId: resultCreateSale.billId,
      });

      if (!resUpdate) {
        return res.status(200).send({
          isSuccess: false,
          message: "Ocurrio un error al actualizar el billing de la orden",
        });
      }


    return res.status(200).send({
      isSuccess: true,
      message: "se actualizo la orden",
    });
  } catch (error) {
    return res.status(200).send({
      isSuccess: false,
      error,
    });
  }
}
