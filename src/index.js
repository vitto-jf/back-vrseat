import app from "./app.js";
import http from "http";


const server = http.createServer(app);
const httpServer = server.listen(5001);


console.log("server running on", 5001);
