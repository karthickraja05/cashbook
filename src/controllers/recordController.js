const mongoose = require("mongoose");
const Record = require("../models/Record");
const Book = require("../models/Book");
const Category = require("../models/Category");

// ➕ Add Record
exports.addRecord = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { category_id, type, amount, date, remarks } = req.body;

        // Validate book
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ status: 0, message: "Invalid book ID" });
        }
        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        // Validate category if provided
        if (category_id) {
            if (!mongoose.Types.ObjectId.isValid(category_id)) {
                return res.status(400).json({ status: 0, message: "Invalid category ID" });
            }
            const category = await Category.findOne({ _id: category_id, book_id: bookId, is_deleted: false });
            if (!category) return res.status(404).json({ status: 0, message: "Category not found" });
        }

        if (!type || !["in", "out"].includes(type)) {
            return res.status(400).json({ status: 0, message: "Type must be 'in' or 'out'" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ status: 0, message: "Amount must be greater than 0" });
        }

        const record = await Record.create({
            book_id: bookId,
            category_id: category_id || null,
            type,
            amount,
            date: date || Date.now(),
            remarks: remarks || "",
        });

        await Book.findByIdAndUpdate(bookId, { updatedAt: Date.now() });

        res.json({ status: 1, message: "Record added successfully", data: record });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};


// 📚 List Records with filters, pagination, totals
exports.listRecords = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { page = 1, limit = 10, category_id, type, from, to, remarks } = req.query;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ status: 0, message: "Invalid book ID" });
        }

        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter

        const bookObjectId = new mongoose.Types.ObjectId(bookId);
        const filter = { is_deleted: false, book_id: bookObjectId };

        if (category_id && mongoose.Types.ObjectId.isValid(category_id)) {
            filter.category_id = new mongoose.Types.ObjectId(category_id);
        }

        if (type && ["in", "out"].includes(type)) filter.type = type;
        if (from || to) filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
        if (remarks) filter.remarks = { $regex: remarks, $options: "i" }; // case-insensitive like

        // Get paginated records
        const records = await Record.find(filter).sort({ date: -1 }).skip(skip).limit(parseInt(limit));

        const totalsResult = await Record.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    cashIn: { $sum: { $cond: [{ $eq: ["$type", "in"] }, "$amount", 0] } },
                    cashOut: { $sum: { $cond: [{ $eq: ["$type", "out"] }, "$amount", 0] } },
                },
            },
            {
                $addFields: {
                    totalAmount: { $subtract: ["$cashIn", "$cashOut"] },
                },
            },
        ]);


        const totalRecord = await Record.countDocuments(filter);

        res.json({
            status: 1,
            message: "Records retrieved successfully",
            data: records,
            totals: totalsResult[0] || { totalAmount: 0, cashIn: 0, cashOut: 0 },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalRecord,
                totalPages: Math.ceil(totalRecord / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};


// ✏️ Update Record
exports.updateRecord = async (req, res) => {
    try {
        const { bookId, recordId } = req.params;
        const { category_id, type, amount, date, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookId) || !mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).json({ status: 0, message: "Invalid ID" });
        }

        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        const record = await Record.findOne({ _id: recordId, book_id: bookId, is_deleted: false });
        if (!record) return res.status(404).json({ status: 0, message: "Record not found" });

        // Validate category if provided
        if (category_id) {
            if (!mongoose.Types.ObjectId.isValid(category_id)) {
                return res.status(400).json({ status: 0, message: "Invalid category ID" });
            }
            const category = await Category.findOne({ _id: category_id, book_id: bookId, is_deleted: false });
            if (!category) return res.status(404).json({ status: 0, message: "Category not found" });
            record.category_id = category_id;
        }

        if (type && ["in", "out"].includes(type)) record.type = type;
        if (amount && amount > 0) record.amount = amount;
        if (date) record.date = date;
        if (remarks !== undefined) record.remarks = remarks;

        await record.save();

        await Book.findByIdAndUpdate(bookId, { updatedAt: Date.now() });

        res.json({ status: 1, message: "Record updated successfully", data: record });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// ❌ Soft Delete Record
exports.deleteRecord = async (req, res) => {
    try {
        const { bookId, recordId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId) || !mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).json({ status: 0, message: "Invalid ID" });
        }

        const book = await Book.findOne({ _id: bookId, user_id: req.user.id, is_deleted: false });
        if (!book) return res.status(404).json({ status: 0, message: "Book not found" });

        const record = await Record.findOne({ _id: recordId, book_id: bookId, is_deleted: false });
        if (!record) return res.status(404).json({ status: 0, message: "Record not found" });

        record.is_deleted = true;
        await record.save();

        res.json({ status: 1, message: "Record deleted successfully (soft delete)" });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};
