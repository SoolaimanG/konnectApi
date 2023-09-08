//*Configuring the server

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import route from "./Routes/route";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import "dotenv/config";

mongoose.Promise = Promise;
mongoose
  .connect(
    "mongodb+srv://suleimaangee:AkvCL1UOEZvI26FR@cluster0.cdqurje.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected"));
mongoose.connection.on("error", (error: Error) => {
  console.log(error.message);
});

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

app.listen(PORT, () => {
  console.log(`Server running on port https://localhost:${PORT}`);
});
