import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URL;

export const connectDb = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to Atlas Cloud!");
  } catch (err) {
    console.log("Connection failed!");
    console.error(err);
    process.exit(1);
  }
};
