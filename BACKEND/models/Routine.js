// models/Routine.js
const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  studentEmail: { type: String, required: true },
  dueDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Routine", RoutineSchema);
