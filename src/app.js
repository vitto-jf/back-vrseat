import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
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
import stripeRoute from "./routes/stripe.routes.js";

// REFERAL CODES
import referalCodeRoute from "./routes/refCode.routes.js";
import paymentOrders from "./routes/paymentOrders.routes.js";
import { createSales } from "./repository/sales/index.js";
import axios from "axios";

const app = express();

PlayFab.settings.developerSecretKey = playfabConfig.secretKey;

PlayFab.settings.titleId = playfabConfig.titleId;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5001",
      "https://vr-seat.vrinsitu.com",
    ],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  express.json({
    verify: function (req, res, buf) {
      const url = req.originalUrl;
      if (url.startsWith("/stripe/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ message: "Servidor funcionando", isSucces: true });
});

app.post("/login", login);
app.get("/create-user", singup);

//QUITAR ITEM
app.get("/remove-item", removeItemInventory);
app.get("/test-cookie", async (req, res) => {
  const result = await axios.post(
    process.env.URL_PATH + "/add-item",
    {
      products: ["BayernVsArsenal"],
      PFuserId: "A4438A4A3C384AB",
    },
    {
      headers: {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7IlBGdXNlcklkIjoiQTQ0MzhBNEEzQzM4NEFCIiwiUEZzZXNzaW9uVXNlciI6IkE0NDM4QTRBM0MzODRBQi1BQ0Y1Q0FBQUNBOTIwRTE2LTQyQ0MxOUUzMDRGQkVCRkEtMjlFMUQtOERDQkJDRkNDMzYyQ0Q0LVdZSVVRdU9GUW8xeVE5b1dDRGVyQlcxYklmSG94dlN1YlpGejNFdi9lTVk9IiwiRVR1c2VyIjoiZGZlODAwMjY5N2ZlMzVlZmQ5NGViYWZiZTI4NDY4NmU6NjQ3ZDg3ZDMwOWQ1YTgyNGNiOTE2NzZjMDIyOGZiZDlmMWNiMTZlZjRjZWY2YmU3NjVkNzY1MGVlZjcwZGQwMDE1MzQ5NmRjMjliZDVlYWFlODNlMTc1YmUzYWUxMDg2ODQ5Mzk1NGIyZDQ3YmI3M2MxMGZkMzJlNzlkOWYzNTExMzlmMTliN2Y5YjY4MjI3ZGI0YWE2MWEzMTBjYmExNjBkYWIwZWM1ZTA5NTE4NjZhODQ2NWZjYzg0NGQ1ZWQ5MTMwNDRmNDcxNzFiYTRiMDU1OGY2YzRmOWEwMmQ0ODIzODE0ODA5MDZiMGQ1ZTUwYmRiOWNkNDRhNmFhMDc3ZGJmOGRmMjBjNThkOTI5MDZiYWZiZTRjZWQ1MGY3Y2EzYzc1MjEyZjhjOWQxN2IxMTk5MWE5MDcwOTg5ZjNmODg0ZWE2NTEwZDFjZjIwMjU0OWYwODkxNWEzNTk3NmEwOTNkNjIxZGUzNzFhYjAyOTg1NGFhOWNjNTA0YTYyNDlkMDk4ZmJmN2MyYmVhNTkwZmI4MzhjMWJjNWExODhkOTk0NzBlMDU2NWZmNzU4N2VhY2UyZmVjOTVkZmI2OWY4MzZiY2ZlMzUzZWFhMzMwYTRlMmU1ODBiYTEwYWU5OTYyMWVhZjUzOTBkZjA2ZGQ2ZTU5Yzk4NjMzNmQ3ZTc4OGVhZDJhNmRlMWVhZThhZjkyZTRiNjM4MjAxY2E2ZmUyNWRiY2U4MzMyOTQzOWU2ZGQ1OTYxMWM4NTEzMDhjNzhhODBhMjNkNDg2OGM3NjljOWI1MmIzODJlMzA0ZTEyOTgzYTE5ZDQ3Y2M0N2NiNzIyOWFhMTNjODQ1N2ZjZGM0MmFiODQ1MjkxNjg2NTNkNWQ0OTY0ODZjODEzODI1YmZhYmNiOWY1NTY2NWJiZTZhNzI0Yjk1ZmZjMTM1NGJhZWI5ZjE4MzI2MjEwZTVhYzMzYmYyYjRiNzg3NzdlNzBiZWNkODI4NTUzY2I0MzEwZDhjNTM2N2U3ZWE1ZmQxZjA0NzVlNmUzOTQ5OTkzODI3YTkzNzEwM2U5NzkxNGMwZDVkMTAzNjQzMGZkYmY4ZjNlYWE5OGNhNDkyZDIwOTgzNGMxMTljZmM2MTJlNDg0NDBiOWZkYzBkNGU0OTE4YzE0N2YxNDAxYzYyYjE5OTczMzMwN2VlMTk5Yzg0NjNhZmJmNWY4YzdiMDY0ZjM1ZWE3OTBmMzAwOGRkNTIwYjA3ZiIsImV4cCI6MTcyMzY2NDQyMX0sImlhdCI6MTcyMzU3ODAyMX0.tAX_yVfYysfryX31x1bBZfAzNFlrcfIHit9DRNlahzI",
      },
      withCredentials: true,
    }
  );

  if (result.data.isSucces) {
    return res.json(result.data);
  }
  return res.json(result.data);
});

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
    req.header;
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

// app.get("/test", async (req, res) => {
//   const result = await createSales("000001", "TEST");
//   console.log(result);
//   return res.json({ result });
// });

app.get("/get-inventory", async (req, res) => {
  try {
    PlayFabServer.GetUserInventory(
      { PlayFabId: "D528E5560821690" },
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
app.use("/stripe", stripeRoute);
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
