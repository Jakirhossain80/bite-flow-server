// middlewares/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "biteflow", // all images will be grouped under this folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

// Multer instance using Cloudinary storage
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
});

export default upload;

