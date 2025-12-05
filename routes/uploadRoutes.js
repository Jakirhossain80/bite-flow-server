// routes/uploadRoutes.js
import express from "express";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Single image upload (field name: "image")
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

  
    const imageUrl = req.file.path;      // Cloudinary URL
    const publicId = req.file.filename;  // Cloudinary public_id

    return res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
      publicId,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

export default router;


