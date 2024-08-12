import dotenv from "dotenv";
import { connectToCluster } from "../../../config/mongoDB.js";
dotenv.config();

export async function verifyOrder(req, res) {
  const uri = process.env.MONGO_URI;

  let mongoClient;
  try {

    
    mongoClient = await connectToCluster(uri);
    const db = mongoClient.db("sample_mflix");
    const query = await db.collection("orders").find().toArray();

    return res.status(200).send({
      isSuccess: true,
      data: query,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoClient.close();
  }
}
