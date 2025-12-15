// authController.js
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Determine environment (dev vs production)
const isProduction = process.env.NODE_ENV === "production";

// Centralized cookie options for all auth cookies
const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // true only in production (HTTPS)
  sameSite: isProduction ? "none" : "lax", // 'lax' in dev so cookie is saved on localhost
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// Generate JWT and set it as an HTTP-only cookie
const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, cookieOptions);
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }

    await User.create({ name, email, password });

    return res.json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid credentials", success: false });
    }

    // Payload matches your existing protect middleware expectations
    generateToken(res, {
      id: user._id,
      role: user.isAdmin ? "admin" : "user",
    });

    return res.json({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.json({ message: "Invalid credentials", success: false });
    }

    // Issue a token that adminOnly can read (it checks decoded.email)
    generateToken(res, { email: adminEmail, role: "admin" });

    return res.json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        admin: adminEmail,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    return res.json(user);
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password");
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};

// ✅ NEW: Admin auth check (use with adminOnly middleware)
export const isAdminAuth = async (req, res) => {
  try {
    // adminOnly middleware sets req.admin = decoded
    return res.json({
      success: true,
      admin: {
        email: req.admin?.email || "admin",
        role: req.admin?.role || "admin",
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
};
