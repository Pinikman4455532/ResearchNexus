const mongoose = require("mongoose");

const notePadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    documentUrl: { type: String, required: true }, // link to uploaded file
    notes: { type: String, default: "" } // note content
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotePad", notePadSchema);
