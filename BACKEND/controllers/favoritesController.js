const Favorite = require('../models/Favorite');

// Get favorites for a user
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userEmail: req.params.userEmail });
    const fileIds = favorites.map(f => f.fileId);
    res.json(fileIds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  const { userEmail, fileId } = req.body;
  try {
    const existing = await Favorite.findOne({ userEmail, fileId });
    if (existing) {
      await Favorite.deleteOne({ userEmail, fileId });
      return res.json({ message: 'Removed from favorites' });
    } else {
      const fav = new Favorite({ userEmail, fileId });
      await fav.save();
      return res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error });
  }
};
