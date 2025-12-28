const NotePad = require("../models/NotePad");
const fs = require("fs");
const path = require("path");
// Create a new NotePad entry
exports.createNotePad = async (req, res) => {
  try {
    const { title, notes } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: "Title and file are required" });
    }

    const documentUrl = `http://localhost:9222/uploads/${req.file.filename}`;

    const newNotePad = new NotePad({ title, documentUrl, notes });
    await newNotePad.save();

    res.status(201).json({ message: "NotePad created successfully", notePad: newNotePad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all NotePad entries
exports.getAllNotePads = async (req, res) => {
  try {
    const notePads = await NotePad.find().sort({ createdAt: -1 });
    res.status(200).json(notePads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update note content
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const notePad = await NotePad.findById(id);
    if (!notePad) return res.status(404).json({ message: "NotePad not found" });

    notePad.notes = notes;
    await notePad.save();

    res.status(200).json({ message: "Note updated successfully", notePad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteNotePad = async (req, res) => {
  try {
    const { id } = req.params;

    const notePad = await NotePad.findById(id);
    if (!notePad) return res.status(404).json({ message: "NotePad not found" });

    // Delete file from uploads folder
    const filePath = path.join(__dirname, "..", notePad.documentUrl.replace(`http://localhost:${process.env.PORT || 5000}/`, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete note from database
    await NotePad.findByIdAndDelete(id);

    res.status(200).json({ message: "NotePad deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
