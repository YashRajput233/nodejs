import mongoose from "mongoose";
import envConfig from "./envConfig.js";

mongoose
  .connect(envConfig.DB_URL)
  .then(() => {
    console.log("Database Connected..👌");
  })
  .catch(() => {
    console.log("error to connnect database");
  });
