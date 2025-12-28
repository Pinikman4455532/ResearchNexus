const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },      // e.g., "P1 Deadline"
  message: { type: String, required: true },    // e.g., "P1 is on 2nd Jan"
  date: { type: Date, required: true },         // Deadline date
  createdBy: { type: String, required: true },  // Email of supervisor who created it
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
