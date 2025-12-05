// middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for temporary local uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // backend/uploads
    const uploadPath = path.join(__dirname, "..", "uploads");
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `image-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
