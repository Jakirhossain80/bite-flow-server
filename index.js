// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";         
import corsOptions from "./cors/corsOptions.js";
import userRoutes from "./routes/userRoutes.js";
import notFound from "./middlerwares/notFound.js";
import errorHandler from "./middlerwares/errorHandler.js";

// Load .env variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Restaurant API is running..." });
});

// Example routes
app.use("/api/users", userRoutes);

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
