import { connectToCluster, dbName } from "../../config/mongoDB.js";

const uri = process.env.MONGO_URI;

export async function queryCreatePaymentOrder(orderData) {
  const { products, amount, PFuserId } = orderData;

  let mongoClient;

  let expDate = new Date();
  let currentMinutes = expDate.getMinutes();
  expDate.setMinutes(currentMinutes + 30);

  mongoClient = await connectToCluster(uri);

  const orderId = await generateAndVerifyOrderId(mongoClient);

  const db = mongoClient.db(dbName);

  const dataObject = {
    products,
    amount,
    userId: PFuserId,
    orderId: orderId,
    billingId: "",
    createdAt: new Date(),

    orderStatus: "pending-for-pay",
    isPaid: false,
    taxes: [],
    totals: {
      totalItems: products.length,
      totalWithoutTaxes: amount,
      totalWithTaxes: amount,
      totalTaxes: 0,
    },
    billingAddress: {
      region: "",
      coordinates: {
        latitude: "",
        longitude: "",
      },
      postalCode: "",
      address: "",
      ipAddress: "",
    },
    comments: [],
    orderType: "stripe-payment",
    referralCode: "",
    currency: {
      name: "Dollar American",
      iso: "USD",
      exchange: 1,
    },
    expirationDate: expDate,
  };

  const result = await db
    .collection("orders")
    .insertOne(dataObject)
    .then((result) => {
      if (!result) {
        console.log(result);
        return result;
      }
      console.log(result);
      return { orderId };
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

export async function getOrder(orderId,userId) {
  let mongoClient;
  mongoClient = await connectToCluster(uri);

  const db = mongoClient.db(dbName);
  const result = await db.collection('orders').findOne({orderId:orderId,userId:userId}).then(res=>{
    if(!res){ 
  
      return 
    }
  
    return res
  }).catch(err=>{

    return err
  }).finally(()=>{
    mongoClient.close()
  })
  return result
}

async function generateAndVerifyOrderId(mongoClient) {
  const db = mongoClient.db("sample_mflix");
  const collection = db.collection("orders");

  const lastOrderId = await getLastOrderId(collection);
  let newCode;

  if (!lastOrderId) {
    newCode = "000001";
  } else {
    const lastCode = parseInt(lastOrderId, 10);
    newCode = (lastCode + 1).toString().padStart(6, "0");
  }

  return `${newCode}`;
}

async function getLastOrderId(collection) {
  const lastOrder = await collection
    .find()
    .sort({ orderId: -1 })
    .limit(1)
    .toArray();
  return lastOrder.length > 0 ? lastOrder[0].orderId : null;
}
