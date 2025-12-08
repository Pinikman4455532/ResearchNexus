// controllers/folderController.js - Folder Controller (UPDATED)

const Folder = require('../models/Folder');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');

// Create Folder
exports.createFolder = async (req, res) => {
    try {
        const { Name, Visibility, ownerEmail, Group_id } = req.body;

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

        const lastFolder = await Folder.findOne().sort({ id: -1 });
        const newId = lastFolder ? lastFolder.id + 1 : 1;

        const newFolder = new Folder({
            Name,
            id: newId,
            Visibility,
            ownerEmail,
            Group_id: groupId
        });

        await newFolder.save();
        res.status(201).json({ message: 'Folder created', folder: newFolder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Folders
exports.getFolders = async (req, res) => {
    try {
        const { ownerEmail } = req.query;

        // Get user's groups
        const supervisor = await Supervisor.findOne({ Gmail: ownerEmail });
        const student = await Student.findOne({ Gmail: ownerEmail });

        let allowedGroups = [];

        if (supervisor) {
            allowedGroups = supervisor.groups;
        } else if (student) {
            allowedGroups = [student.Group_id];
        }

        const folders = await Folder.find({
            Group_id: { $in: allowedGroups },
            $or: [
                { ownerEmail: ownerEmail },
                { Visibility: true }
            ]
        });

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Folder Name
exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, Visibility } = req.body;

        const updatedFolder = await Folder.findOneAndUpdate(
            { id: parseInt(id) },
            { Name, Visibility },
            { new: true }
        );

        res.status(200).json({ message: 'Folder updated', folder: updatedFolder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search Folders
exports.searchFolders = async (req, res) => {
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

        const folders = await Folder.find({
            Name: { $regex: query, $options: 'i' },
            Group_id: { $in: allowedGroups },
            $or: [
                { ownerEmail: ownerEmail },
                { Visibility: true }
            ]
        });

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Folder
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;

        await Folder.findOneAndDelete({ id: parseInt(id) });
        res.status(200).json({ message: 'Folder deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};