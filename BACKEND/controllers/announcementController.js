const Announcement = require('../models/Announcement');

// Create new announcement (only authority@gmail.com)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, date, createdBy } = req.body;

    // Check if the creator is authorized
    if (createdBy !== 'authority@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const announcement = new Announcement({ title, message, date, createdBy });
    await announcement.save();

    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: 1 });
    res.status(200).json({ announcements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
