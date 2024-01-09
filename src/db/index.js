import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      `Mongodb Connected: DB Host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("mongodb connection error", error);
    process.exit(1);
  }
};

export default connectDB;
