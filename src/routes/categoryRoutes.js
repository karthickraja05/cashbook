const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to get bookId from parent route
const authMiddleware = require("../middleware/authMiddleware");
const {
    addCategory,
    listCategories,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

// Routes protected by JWT
router.post("/", authMiddleware, addCategory);
router.get("/", authMiddleware, listCategories);
router.put("/:categoryId", authMiddleware, updateCategory);
router.delete("/:categoryId", authMiddleware, deleteCategory);

module.exports = router;
