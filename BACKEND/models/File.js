// models/File.js - File Model (UPDATED)

const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Folder: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    },
    Type: {
        type: String,
        default: 'File'
    },
    Visibility: {
        type: Boolean,
        default: true
    },
    filePath: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    Group_id: {  // ⬅️ ADDED
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('File', FileSchema);