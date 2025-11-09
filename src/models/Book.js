const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    is_deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
