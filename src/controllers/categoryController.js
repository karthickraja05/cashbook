const mongoose = require("mongoose");
const Category = require("../models/Category");
const Book = require("../models/Book");

// ➕ Add Category
exports.addCategory = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ status: 0, message: "Invalid book ID" });
        }

        // Check if book exists and belongs to user
        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) {
            return res.status(404).json({ status: 0, message: "Book not found" });
        }

        if (!name) {
            return res.status(400).json({ status: 0, message: "Category name is required" });
        }

        const category = await Category.create({ book_id: bookId, name });

        await Book.findByIdAndUpdate(bookId, { updatedAt: Date.now() });

        res.json({ status: 1, message: "Category added successfully", data: category });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// 📚 List Categories for a book
exports.listCategories = async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ status: 0, message: "Invalid book ID" });
        }

        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) {
            return res.status(404).json({ status: 0, message: "Book not found" });
        }

        const categories = await Category.find({ book_id: bookId, is_deleted: false }).sort({ createdAt: -1 });

        res.json({ status: 1, message: "Categories retrieved successfully", data: categories });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// ✏️ Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { bookId, categoryId } = req.params;
        const { name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ status: 0, message: "Invalid ID" });
        }

        // Check book ownership
        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        const category = await Category.findOne({ _id: categoryId, book_id: bookId, is_deleted: false });
        if (!category) return res.status(404).json({ status: 0, message: "Category not found" });

        if (name) category.name = name;
        await category.save();

        await Book.findByIdAndUpdate(bookId, { updatedAt: Date.now() });

        res.json({ status: 1, message: "Category updated successfully", data: category });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// ❌ Soft Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { bookId, categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ status: 0, message: "Invalid ID" });
        }

        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        const category = await Category.findOne({ _id: categoryId, book_id: bookId, is_deleted: false });
        if (!category) return res.status(404).json({ status: 0, message: "Category not found" });

        category.is_deleted = true;
        await category.save();

        res.json({ status: 1, message: "Category deleted successfully (soft delete)" });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};
