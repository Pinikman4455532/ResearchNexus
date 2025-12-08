// routes/folderRoutes.js - Folder Routes

const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

// Create Folder
router.post('/', folderController.createFolder);

// Get All Folders
router.get('/', folderController.getFolders);

// Update Folder
router.put('/:id', folderController.updateFolder);

// Search Folders
router.get('/search', folderController.searchFolders);

// Delete Folder
router.delete('/:id', folderController.deleteFolder);

module.exports = router;