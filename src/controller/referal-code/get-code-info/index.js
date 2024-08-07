import  dotenv  from 'dotenv';
import { connectToCluster } from '../../../config/mongoDB.js'
dotenv.config();

export async function executecGetCodeInfo(req, res){
  try {
    const codesInfo = await getCodesInfo(req.body.code);
    return res.status(200).send({
      isSuccess: true,
      message: codesInfo,
    });
      
  } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Error en la solicitud",
        isSuccess: false,
        error: error.response ? error.response.data : error.message,
      });
    }
}


export async function getCodesInfo(codeToSearch) {
  const uri = process.env.MONGO_URI;
  let mongoClient;
  let result = [];
  let cursor;
  
  try {
    mongoClient = await connectToCluster(uri);
    const db = mongoClient.db('sample_mflix');
    const collection = db.collection('referal_codes');
    if(codeToSearch){
      cursor = collection.find({code: codeToSearch});
    } else {
      cursor = collection.find();
    }
    for await (const code of cursor) {
        result.push(code);
      }
    return result;

  } catch (error) {
      console.error(error);

  } finally {
      await mongoClient.close();
  }
}