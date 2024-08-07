import  dotenv  from 'dotenv';
import { getCodesInfo } from '../get-code-info/index.js';
dotenv.config();

export async function executecCodeValidation(req, res){
    try {
        if(codesValidation(getCodesInfo(req.body.code))){
            return res.status(200).send({
                message: true,
                isSuccess: true,
              });
        } else {
            return res.status(200).send({
                message: false,
                isSuccess: true,
              });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
          message: "Error en la solicitud",
          isSuccess: false,
          error: error.response ? error.response.data : error.message,
        });
    }
}

function codesValidation(codesToValidate){
    try{
        for (code in codesToValidate) {
            if (!code.active) return false;
        }
        return true;
    } catch (err) {
        console.error(error);
    }
}