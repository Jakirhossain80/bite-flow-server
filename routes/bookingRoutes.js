// routes/bookingRoutes.js
import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const bookingRoutes = express.Router();

// User routes
bookingRoutes.post("/create", protect, createBooking);
bookingRoutes.get("/my-bookings", protect, getUserBookings);

// Admin routes
bookingRoutes.get("/bookings", adminOnly, getAllBookings);
bookingRoutes.put("/update-status/:bookingId", adminOnly, updateBookingStatus);

export default bookingRoutes;
