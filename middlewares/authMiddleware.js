// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

// Protect middleware: for normal authenticated users (and DB-based admins)
export const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // We expect normal users (and DB-admins) to have an id
    if (!decoded.id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    // Attach a normalized user object to the request
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid token", success: false });
  }
};

// Admin-only middleware: for admin routes (env-based admin OR DB-based admin)
export const adminOnly = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not Authorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const isEnvAdmin = decoded.email === process.env.ADMIN_EMAIL;
    const isRoleAdmin = decoded.role === "admin";

    if (isEnvAdmin || isRoleAdmin) {
      req.admin = decoded;
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
