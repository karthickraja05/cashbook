const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    type: { type: String, enum: ["in", "out"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    remarks: { type: String, default: "" },
    is_deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Record", recordSchema);
