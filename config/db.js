// config/db.js
//Mongodb connection

import mongoose from "mongoose";

const connectDB = async () => {
  try {
   
    const mongoURI = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME || "restaurantAppDB";

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    // Modern Mongoose way: pass dbName in options
    const conn = await mongoose.connect(mongoURI, {
      dbName, // tells MongoDB which database to use
    });

    console.log(
      `✅ MongoDB connected: ${conn.connection.host} / DB: ${conn.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // stop the server if DB fails
  }
};

export default connectDB;
