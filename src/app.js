import express from "express";
import cors from "cors";

import { PlayFabServer } from "playfab-sdk";

import PlayFab from "playfab-sdk/Scripts/PlayFab/PlayFab.js";
//import PlayFab from "playfab-sdk";

import cookieParser from "cookie-parser";

import { playfabConfig } from "./config/playfab.js";
import { verifyExistItem } from "./middleware/verifyExistItem.js";

import { verifyDuplicatedItemUserInvetory } from "./middleware/verifyDuplicateItemUserInventory.js";
import { login } from "./controller/auth/login/index.js";
import { singup } from "./controller/auth/singup/index.js";
import { removeItemInventory } from "./controller/inventory/remove-item/index.js";
import { addItemInventoryUser } from "./controller/inventory/add-item/index.js";
import { CompileErrorReport } from "./utils/utils.js";

import paymentRoute from "./routes/payment.routes.js";

// REFERAL CODES
import referalCodeRoute from "./routes/refCode.routes.js";
import paymentOrders from "./routes/paymentOders.routes.js";


const app = express();

PlayFab.settings.developerSecretKey = playfabConfig.secretKey;

PlayFab.settings.titleId = playfabConfig.titleId;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ message: "Servidor funcionando", isSucces: true });
});

app.post("/login", login);
app.get("/create-user", singup);

//QUITAR ITEM
app.get("/remove-item", removeItemInventory);

//AGREGAR ITEM AL USUARIO
app.post(
  "/add-item",
  verifyExistItem,
  verifyDuplicatedItemUserInvetory,
  addItemInventoryUser
);

//VALID ITEM
app.post(
  "/verify-sell",
  verifyExistItem,
  verifyDuplicatedItemUserInvetory,
  async (req, res) => {
    try {
      return res.json({
        isSuccess: true,
        message: "Item validado, no hay errores",
        isValid: true,
      });
    } catch (error) {
      return res.json({
        isSuccess: false,
        message: "Ocurrio un error en el servidor",
        error,
        isValid: false,
      });
    }
  }
);

app.get("/get-inventory", async (req, res) => {
  try {
    PlayFabServer.GetUserInventory(
      { PlayFabId: "A4438A4A3C384AB" },
      (error, result) => {
        if (result !== null) {
          console.log(result);
          res.json({
            message: "¡Datos obtenidos",
            result,
          });
        } else if (error !== null) {
          console.log(CompileErrorReport(error));

          res.status(500).json({
            message: "Algo salió mal con tu primera llamada a la API.",
            debugInfo: CompileErrorReport(error),
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error en la solicitud",
      isSuccess: false,
      error: error.response ? error.response.data : error.message,
    });
  }
});

app.use("/payment-orders", paymentOrders);
app.use("/payment", paymentRoute);

/***************************************************
 ***************** REFERAL CODES *******************
 **************************************************/
app.use("/referal-code", referalCodeRoute);

// app.post(
//   "/use-referal-code",
//   validateCode,
//   assingCode
// );

/***************************************************
 *************** REFERAL CODES END *****************
 **************************************************/
export default app;
