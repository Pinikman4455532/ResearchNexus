// models/Supervisor.js - Supervisor Model (UPDATED)

const mongoose = require('mongoose');

const SupervisorSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Interest: {
        type: String,
        required: true
    },
    Gmail: {
        type: String,
        required: true,
        unique: true
    },
    groups: {
        type: [Number],  // ⬅️ CHANGED FROM [String] TO [Number]
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Supervisor', SupervisorSchema);