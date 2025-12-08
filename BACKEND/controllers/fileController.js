// controllers/fileController.js - File Controller (UPDATED)

const File = require('../models/File');
const Folder = require('../models/Folder');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload File
exports.uploadFile = async (req, res) => {
    try {
        console.log('Upload request body:', req.body);
        console.log('Upload file:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { Name, Folder: folderId, Visibility, ownerEmail, Group_id } = req.body;
        const filePath = req.file.path;

        if (!Name || !folderId || !ownerEmail || !Group_id) {
            return res.status(400).json({
                message: 'Missing required fields: Name, Folder, ownerEmail, or Group_id'
            });
        }

        // Validate group access
        const supervisor = await Supervisor.findOne({ Gmail: ownerEmail });
        const student = await Student.findOne({ Gmail: ownerEmail });

        const groupId = parseInt(Group_id);

        if (supervisor) {
            if (!supervisor.groups.includes(groupId)) {
                return res.status(403).json({ message: 'You do not have access to this group' });
            }
        } else if (student) {
            if (student.Group_id !== groupId) {
                return res.status(403).json({ message: 'You do not have access to this group' });
            }
        }

        const lastFile = await File.findOne().sort({ id: -1 });
        const newId = lastFile ? lastFile.id + 1 : 1;

        const newFile = new File({
            Name,
            Folder: parseInt(folderId),
            id: newId,
            Visibility: Visibility === 'true' || Visibility === true,
            filePath,
            ownerEmail,
            Group_id: groupId
        });

        await newFile.save();

        await Folder.findOneAndUpdate(
            { id: parseInt(folderId) },
            { $inc: { File: 1 } }
        );

        res.status(201).json({ message: 'File uploaded', file: newFile });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Files by Folder
exports.getFilesByFolder = async (req, res) => {
    try {
        const { folderId, ownerEmail } = req.query;

        // Get user's groups
        const supervisor = await Supervisor.findOne({ Gmail: ownerEmail });
        const student = await Student.findOne({ Gmail: ownerEmail });

        let allowedGroups = [];

        if (supervisor) {
            allowedGroups = supervisor.groups;
        } else if (student) {
            allowedGroups = [student.Group_id];
        }

        const files = await File.find({
            Folder: parseInt(folderId),
            Group_id: { $in: allowedGroups },
            $or: [
                { ownerEmail: ownerEmail },
                { Visibility: true }
            ]
        });

        res.status(200).json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search Files
exports.searchFiles = async (req, res) => {
    try {
        const { query, ownerEmail } = req.query;

        // Get user's groups
        const supervisor = await Supervisor.findOne({ Gmail: ownerEmail });
        const student = await Student.findOne({ Gmail: ownerEmail });

        let allowedGroups = [];

        if (supervisor) {
            allowedGroups = supervisor.groups;
        } else if (student) {
            allowedGroups = [student.Group_id];
        }

        const files = await File.find({
            Name: { $regex: query, $options: 'i' },
            Group_id: { $in: allowedGroups },
            $or: [
                { ownerEmail: ownerEmail },
                { Visibility: true }
            ]
        });

        res.status(200).json(files);
    } catch (error) {
        console.error('Search files error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Download File
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findOne({ id: parseInt(id) });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = path.join(__dirname, '..', file.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, file.Name);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete File
exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findOne({ id: parseInt(id) });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }

        await Folder.findOneAndUpdate(
            { id: file.Folder },
            { $inc: { File: -1 } }
        );

        await File.findOneAndDelete({ id: parseInt(id) });
        res.status(200).json({ message: 'File deleted' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.upload = upload;