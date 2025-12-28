const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  fileId: {
    type: Number,
    required: true
  }
}, { timestamps: true });

FavoriteSchema.index({ userEmail: 1, fileId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
