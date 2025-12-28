const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Only authority can post
router.post('/create', announcementController.createAnnouncement);

// Anyone can fetch
router.get('/', announcementController.getAllAnnouncements);

module.exports = router;
