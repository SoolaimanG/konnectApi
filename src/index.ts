//*Configuring the server

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import route from "./Routes/route";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./functions/func";

const app = express();

const PORT = 80;

//To Prevent Cross Origin Requests
app.use(
  cors({
    credentials: true,
  })
);

//Allow to use cookies
app.use(cookieParser());

//Allow to use parse req.body
app.use(bodyParser.json());

app.use("/", route());

app.use(connectDB);

app.listen(PORT, () => {
  console.log(`Server running on port https://localhost:${PORT}`);
});
