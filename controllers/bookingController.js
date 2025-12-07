// controllers/bookingController.js
import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";

export const createBooking = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { name, phone, numberOfPeople, date, time, note } = req.body;

    if (!id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    if (!name || !phone || !numberOfPeople || !date || !time) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Check for overlapping bookings (same date & time, not cancelled)
    const existingBooking = await Booking.findOne({
      date,
      time,
      status: { $ne: "Cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "This time slot is already booked",
        success: false,
      });
    }

    const booking = await Booking.create({
      user: id,
      name,
      phone,
      numberOfPeople,
      date,
      time,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Table booked successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { id } = req.user || {};

    if (!id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    const bookings = await Booking.find({ user: id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Approved", "Cancelled"];

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json({ message: "Invalid booking id", success: false });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        success: false,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found", success: false });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
