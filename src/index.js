import app from "./app.js";
import http from "http";

import dotenv from "dotenv";
dotenv.config();
const server = http.createServer(app);
server.listen(process.env.PORT??8000);

console.log("server running on", process.env.PORT??8000);
