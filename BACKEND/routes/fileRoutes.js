// routes/fileRoutes.js - File Routes

const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Get Files by Folder
router.get('/', fileController.getFilesByFolder);

// Search Files (must be before /:id)
router.get('/search', fileController.searchFiles);

// Download File - ADD THIS
router.get('/download/:id', fileController.downloadFile);

// Upload File
router.post('/', fileController.upload.single('file'), fileController.uploadFile);

// Delete File
router.delete('/:id', fileController.deleteFile);

module.exports = router;