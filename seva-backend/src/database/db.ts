import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};