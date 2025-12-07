// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is a normal user token (must have an id)
    if (!decoded.id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    // Attach a normalized user object
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid token", success: false });
  }
};

export const adminOnly = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;

    if (req.admin.email === process.env.ADMIN_EMAIL) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "Forbidden", success: false });
  } catch (error) {
    console.error("Admin JWT verify error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid token", success: false });
  }
};
