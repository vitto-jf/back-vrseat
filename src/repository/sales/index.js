import { connectToCluster, dbName } from "../../config/mongoDB.js";
import { getOrder } from "../payment-orders/index.js";

const uri = process.env.MONGO_URI;

export async function createSales(orderId, userId) {
  let mongoClient;
  let expDate = new Date();
  let currentMinutes = expDate.getMinutes();
  expDate.setMinutes(currentMinutes + 30);

  mongoClient = await connectToCluster(uri);

  const resultGetOrder = await getOrder(orderId, userId);
  if (!resultGetOrder) {
    return { isSuccess: false, message: "no existe la orden" };
  }

  const db = mongoClient.db(dbName);
  const { _id, ...dataOrder } = resultGetOrder;
  const dataObject = {
    orderId: resultGetOrder["_id"],
    ref: resultGetOrder.orderId,
    ...dataOrder,
  };

  const result = await db
    .collection("sales")
    .insertOne(dataObject)
    .then((result) => {
      if (!result) {
        console.log(result);
        return {result, isSuccess: false};
      }

      return {
        isSuccess: true,
        message: "Se creo la venta",
        billId: result.insertedId,
      };
    })
    .catch((error) => {
      console.log(error);
      return error;
    })
    .finally(() => {
      mongoClient.close();
    });
  return result;
}
