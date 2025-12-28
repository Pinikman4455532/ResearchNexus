const express = require("express");
const router = express.Router();
const NotePadController = require("../controllers/NotePadController");
const multer = require("multer");
const path = require("path");

// Set storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("file"), NotePadController.createNotePad);
router.get("/", NotePadController.getAllNotePads);
router.put("/:id", NotePadController.updateNote);
router.delete("/:id", NotePadController.deleteNotePad);

module.exports = router;

