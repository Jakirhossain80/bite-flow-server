// controllers/menuController.js
import fs from "fs";
import Menu from "../models/menuModel.js";
import cloudinary from "../config/cloudinary.js";

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category || !req.file) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "biteflow/menu",
    });

    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting local file:", err.message);
    });

    const newMenuItem = await Menu.create({
      name: name.trim(),
      description,
      price: Number(price),
      category,
      image: uploadResult.secure_url,
    });

    return res.status(201).json({
      message: "Menu item added",
      success: true,
      menuItem: newMenuItem,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, menuItems });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;

    const menuItem = await Menu.findById(id);
    if (!menuItem) {
      return res
        .status(404)
        .json({ message: "Menu item not found", success: false });
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "biteflow/menu",
      });

      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err.message);
      });

      menuItem.image = uploadResult.secure_url;
    }

    if (name) menuItem.name = name.trim();
    if (description) menuItem.description = description;
    if (price !== undefined) menuItem.price = Number(price);
    if (category) menuItem.category = category;
    if (isAvailable !== undefined) {
      menuItem.isAvailable =
        isAvailable === true || isAvailable === "true" ? true : false;
    }

    await menuItem.save();

    return res
      .status(200)
      .json({ message: "Menu item updated", success: true, menuItem });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByIdAndDelete(id);

    if (!menuItem) {
      return res
        .status(404)
        .json({ message: "Menu item not found", success: false });
    }

    return res
      .status(200)
      .json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
