import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
console.log("im here");
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`your app is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection Error :", error);
  });
