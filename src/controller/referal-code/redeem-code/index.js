import dotenv from "dotenv";
import {
  deactivateCode,
  getCodesInfo,
} from "../../../repository/referal-code/index.js";
import { codesValidation } from "../validate-code/index.js";
import { addItemToUserInventory } from "../../../repository/playfab-utils/index.js";
dotenv.config();

export async function executeRedeemCode(req, res) {
  const { userId, code } = req.body;

  const codesInfo = await getCodesInfo(code);
  console.log("executeRedeemCode" + JSON.stringify(codesInfo));
  try {
    if (codesValidation(codesInfo)) {
      for (const code of codesInfo) {
        console.log("for from codes validation" + JSON.stringify(code));
        addItemToUserInventory(code.product_id, userId);
        deactivateCode(code.code);
      }
      return res.status(200).send({
        isSuccess: true,
        message: "Codigo activo",
      });
    } else {
      return res.status(500).send({
        message: "El codigo se encuentra inactivo",
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
