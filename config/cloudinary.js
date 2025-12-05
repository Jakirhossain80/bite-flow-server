// config/cloudinary.js
import dotenv from "dotenv";
dotenv.config(); // make sure .env is loaded here

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional: quick sanity check during development
// console.log("Cloudinary config:", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
// });

export default cloudinary;
