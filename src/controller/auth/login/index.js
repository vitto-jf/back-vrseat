import { PlayFab, PlayFabClient } from "playfab-sdk";
import { encrypt,CompileErrorReport, JWT_SECRET } from "../../../utils/utils.js";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function login(req, res) {
  const { userEmail, userPassword } = req.body;
  try {
    const loginRequest = {
      TitleId: PlayFab.settings.titleId,
      Email: userEmail,
      Password: userPassword,
    };

    PlayFabClient.LoginWithEmailAddress(loginRequest, (error, result) => {
      if (result !== null) {
        const { data } = result;

        // Cifrar los datos sensibles
        const encryptedPayloadEntity = encrypt(data.EntityToken.EntityToken);
        // Datos sensibles a cifrar
        const payload = {
          PFuserId: data.PlayFabId,
          PFsessionUser: data.SessionTicket,
          ETuser: encryptedPayloadEntity,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Expira en 24 horas
        };

        // Firmar el JWT con el payload cifrado
        const token = jwt.sign({ data: payload }, JWT_SECRET);

        const serializedToken = serialize("session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 60 * 60 * 24, // 24 horas en segundos
          path: "/",
        });
        res.setHeader("Set-Cookie", serializedToken);
        return res.json({
          message: "¡Felicidades, Logeo exitoso!",
        });
      } else if (error !== null) {
        res.status(500).json({
          message: "Algo salió mal con tu primera llamada a la API.",
          debugInfo: CompileErrorReport(error),
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
