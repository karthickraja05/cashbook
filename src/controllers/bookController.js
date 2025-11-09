const Book = require("../models/Book");
const mongoose = require("mongoose");

// 📘 Add Book
exports.addBook = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ status: 0, message: "Title is required" });
        }

        const book = await Book.create({
            user_id: req.user.id,
            title,
            description,
        });

        res.json({
            status: 1,
            message: "Book created successfully",
            data: book,
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// 📗 List Books (Paginated)
exports.listBooks = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query; // default values

        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            Book.find({
                user_id: req.user.id,
                is_deleted: false,
            })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),

            Book.countDocuments({
                user_id: req.user.id,
                is_deleted: false,
            })
        ]);

        res.json({
            status: 1,
            message: "Books retrieved successfully",
            data: books,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};


// ✏️ Update Book
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        // Check valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 0,
                message: "Invalid book ID format",
            });
        }

        const book = await Book.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            { title, description },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ status: 0, message: "Book not found" });
        }

        res.json({
            status: 1,
            message: "Book updated successfully",
            data: book,
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// ❌ Soft Delete Book
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Check valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 0,
                message: "Invalid book ID format",
            });
        }

        // Step 1: Check if book exists and not already deleted
        const book = await Book.findOne({
            _id: id,
            user_id: req.user.id,
            is_deleted: false
        });

        if (!book) {
            return res.status(404).json({
                status: 0,
                message: "Book not found or already deleted",
            });
        }

        // Step 2: Soft delete the book
        book.is_deleted = true;
        await book.save();

        res.json({
            status: 1,
            message: "Book deleted successfully (soft delete)",
        });
    } catch (error) {
        res.status(500).json({
            status: 23,
            message: error.message,
        });
    }
};

