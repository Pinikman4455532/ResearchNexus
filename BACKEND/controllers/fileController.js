// controllers/fileController.js - File Controller

const File = require('../models/File');
const Folder = require('../models/Folder');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Keep original file name
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload File
exports.uploadFile = async (req, res) => {
  try {
    const { Name, Folder: folderId, Visibility, ownerEmail } = req.body;
    const filePath = req.file.path;

    // Check if a file with the same name exists in the folder
    const existingFile = await File.findOne({ Name, Folder: parseInt(folderId) });
    if (existingFile) {
      // Delete old file from storage
      if (fs.existsSync(existingFile.filePath)) {
        fs.unlinkSync(existingFile.filePath);
      }

      // Delete old file record
      await File.deleteOne({ id: existingFile.id });

      // Decrement folder file count
      await Folder.findOneAndUpdate(
        { id: parseInt(folderId) },
        { $inc: { File: -1 } }
      );
    }

    // Create new file record
    const lastFile = await File.findOne().sort({ id: -1 });
    const newId = lastFile ? lastFile.id + 1 : 1;

    const newFile = new File({
      Name,
      Folder: parseInt(folderId),
      id: newId,
      Visibility,
      filePath,
      ownerEmail
    });

    await newFile.save();

    // Increment folder file count
    await Folder.findOneAndUpdate(
      { id: parseInt(folderId) },
      { $inc: { File: 1 } }
    );

    res.status(201).json({ message: 'File uploaded', file: newFile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Files by Folder
exports.getFilesByFolder = async (req, res) => {
  try {
    const { folderId, ownerEmail } = req.query;

    const files = await File.find({
      Folder: parseInt(folderId),
      $or: [
        { ownerEmail: ownerEmail },
        { Visibility: true }
      ]
    });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Files
exports.searchFiles = async (req, res) => {
  try {
    const { query, ownerEmail } = req.query;

    const files = await File.find({
      Name: { $regex: query, $options: 'i' },
      $or: [
        { ownerEmail: ownerEmail },
        { Visibility: true }
      ]
    });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete File
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ id: parseInt(id) });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Delete file from storage
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Decrement folder file count
    await Folder.findOneAndUpdate(
      { id: file.Folder },
      { $inc: { File: -1 } }
    );

    // Delete file record
    await File.findOneAndDelete({ id: parseInt(id) });

    res.status(200).json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Multer upload middleware
exports.upload = upload;
