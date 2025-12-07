// controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

export const placeOrder = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { address, paymentMethod } = req.body;

    if (!id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    if (!address) {
      return res
        .status(400)
        .json({ message: "Delivery address is required", success: false });
    }

    const cart = await Cart.findOne({ user: id }).populate("items.menuItem");

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Your cart is empty", success: false });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      user: id,
      items: cart.items.map((item) => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
      })),
      totalAmount,
      address,
      paymentMethod, // model has default if this is undefined
    });

    // Clear cart after successful order placement
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user || {};

    if (!id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    const orders = await Order.find({ user: id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Preparing", "Delivered"];

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ message: "Invalid order id", success: false });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        success: false,
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    order.status = status;
    await order.save();

    return res.json({
      message: "Order status updated",
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
