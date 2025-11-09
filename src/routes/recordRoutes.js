const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middleware/authMiddleware");
const {
    addRecord,
    listRecords,
    updateRecord,
    deleteRecord,
} = require("../controllers/recordController");

// JWT protected
router.post("/", authMiddleware, addRecord);
router.get("/", authMiddleware, listRecords);
router.put("/:recordId", authMiddleware, updateRecord);
router.delete("/:recordId", authMiddleware, deleteRecord);

module.exports = router;
