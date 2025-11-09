const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    addBook,
    listBooks,
    updateBook,
    deleteBook,
} = require("../controllers/bookController");

// All routes protected
router.post("/", authMiddleware, addBook);
router.get("/", authMiddleware, listBooks);
router.put("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);

module.exports = router;
