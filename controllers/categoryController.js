// controllers/categoryController.js
import fs from "fs";
import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !req.file) {
      return res
        .status(400)
        .json({ message: "Name and image are required", success: false });
    }

    const alreadyExists = await Category.findOne({ name: name.trim() });
    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "biteflow/categories",
    });

    // Optional: remove local temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting local file:", err.message);
    });

    const newCategory = await Category.create({
      name: name.trim(),
      image: uploadResult.secure_url,
    });

    return res.status(201).json({
      message: "Category added",
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "biteflow/categories",
      });

      // Optional: remove local temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err.message);
      });

      category.image = uploadResult.secure_url;
    }

    if (name) {
      category.name = name.trim();
    }

    await category.save();

    return res
      .status(200)
      .json({ message: "Category updated", success: true, category });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
