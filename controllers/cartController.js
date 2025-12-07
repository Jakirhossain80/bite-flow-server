// controllers/cartController.js
import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Menu from "../models/menuModel.js";

export const addToCart = async (req, res) => {
  try {
    const { menuId, quantity } = req.body;
    const { id } = req.user || {};

    if (!id) {
      return res
        .status(401)
        .json({ message: "Not Authorized", success: false });
    }

    if (!menuId || quantity === undefined) {
      return res.status(400).json({
        message: "menuId and quantity are required",
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res
        .status(400)
        .json({ message: "Invalid menuId", success: false });
    }

    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive number",
        success: false,
      });
    }

    const menuItem = await Menu.findById(menuId);
    if (!menuItem) {
      return res
        .status(404)
        .json({ message: "Menu item not found", success: false });
    }

    let cart = await Cart.findOne({ user: id });
    if (!cart) {
      cart = new Cart({ user: id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItem.toString() === menuId
    );

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.items.push({ menuItem: menuId, quantity: parsedQuantity });
    }

    await cart.save();

    return res
      .status(200)
      .json({ message: "Item added to cart", success: true, cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getCart = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOne({ user: id }).populate("items.menuItem");

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, cart: { user: id, items: [] } });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.user;
    const { menuId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res
        .status(400)
        .json({ message: "Invalid menuId", success: false });
    }

    const cart = await Cart.findOne({ user: id });
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Cart not found", success: false });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        message: "Item not found in cart",
        success: false,
      });
    }

    await cart.save();

    return res
      .status(200)
      .json({ message: "Item removed from cart", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
