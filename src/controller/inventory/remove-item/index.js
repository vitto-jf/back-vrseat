import axios from "axios";
import { playfabConfig } from "../../../config/playfab.js";

export async function removeItemInventory(req, res) {
  try {
    const call = await axios.post(
      `https://${playfabConfig.titleId}.playfabapi.com/Admin/RevokeInventoryItem`,
      { PlayFabId: "A4438A4A3C384AB", ItemInstanceId: "CB90F7288A1FDBD7" },
      {
        headers: {
          "X-SecretKey": playfabConfig.secretKey,
          "X-EntityToken":
            "NHxzVVVFZXQrclN6akNYWHNpRWxmWmdoNEJWUmhpYUZTV3Y2QXdjZ1Q2WTd3PXx7ImkiOiIyMDI0LTA3LTMxVDIzOjM1OjA4WiIsImlkcCI6IkN1c3RvbSIsImUiOiIyMDI0LTA4LTAxVDIzOjM1OjA4WiIsImZpIjoiMjAyNC0wNy0zMVQyMzozNTowOFoiLCJ0aWQiOiJpS1d4b09kQjBxOCIsImlkaSI6InRlc3Qtdml0dG8iLCJoIjoiaW50ZXJuYWwiLCJlYyI6InRpdGxlX3BsYXllcl9hY2NvdW50IUFDRjVDQUFBQ0E5MjBFMTYvMjlFMUQvQUNEOEEzOEYxQjNBRUQ4MS9GMTM2QjUxOTIzRDM1Q0VELyIsImVpIjoiRjEzNkI1MTkyM0QzNUNFRCIsImV0IjoidGl0bGVfcGxheWVyX2FjY291bnQifQ==",
        },
      } 
    );

    const data = call.data;
    res.send({ message: "Test funcionando", isSuccess: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error en la solicitud",
      isSuccess: false,
      error: error.response ? error.response.data : error.message,
    });
  }
}
