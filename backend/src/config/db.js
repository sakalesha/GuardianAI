import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const envUri = process.env.MONGODB_URI;
    const uri = (envUri && envUri.startsWith("mongodb")) ? envUri : "mongodb://127.0.0.1:27017/civicproof";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error connecting to MongoDB: ${errorMessage}`);
    process.exit(1);
  }
};
