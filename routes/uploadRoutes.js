// routes/uploadRoutes.js
import express from "express";
import fs from "fs";
import upload from "../middlewares/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const localPath = req.file.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "biteflow",
    });

    // Optional: delete local file after upload
    fs.unlink(localPath, (err) => {
      if (err) console.error("Error deleting local file:", err.message);
    });

    return res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Image upload failed" });
  }
});


export default router;
