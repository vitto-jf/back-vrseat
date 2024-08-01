import express from "express";
import cors from "cors";

import { PlayFabServer } from "playfab-sdk";

import PlayFab from "playfab-sdk/Scripts/PlayFab/PlayFab.js";

import cookieParser from "cookie-parser";

import { playfabConfig } from "./config/playfab.js";
import { verifyExistItem } from "./middleware/verifyExistItem.js";

import { verifyDuplicatedItemUserInvetory } from "./middleware/verifyDuplicateItemUserInventory.js";
import { login } from "./controller/auth/login/index.js";
import { singup } from "./controller/auth/singup/index.js";
import { removeItemInventory } from "./controller/inventory/remove-item/index.js";
import { addItemInventoryUser } from "./controller/inventory/add-item/index.js";

const app = express();

PlayFab.settings.developerSecretKey = playfabConfig.secretKey;
PlayFab.settings.titleId = playfabConfig.titleId;
app.use(
  cors({
    origin: "http://localhost:3000", // Reemplaza con la URL de tu frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
export default app;
