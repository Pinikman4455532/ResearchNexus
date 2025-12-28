const mongoose = require('mongoose');

const SupervisorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Interest: { type: String, required: true },
  Gmail: { type: String, required: true, unique: true },
  groups: { type: [String], default: [] },

  phone: { type: String, default: '' },
  address: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('Supervisor', SupervisorSchema);
