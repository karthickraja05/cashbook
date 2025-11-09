const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    name: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);