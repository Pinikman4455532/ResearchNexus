const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');

// Get Profile
exports.getProfile = async (req, res) => {
  const { email, userType } = req.query;

  try {
    const user =
      userType === 'student'
        ? await Student.findOne({ Gmail: email })
        : await Supervisor.findOne({ Gmail: email });

    if (!user) return res.status(404).json({ message: 'Profile not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Profile (phone & address only)
exports.updateProfile = async (req, res) => {
  const { email, userType } = req.body;
  const { phone, address } = req.body;

  try {
    const Model = userType === 'student' ? Student : Supervisor;

    const updated = await Model.findOneAndUpdate(
      { Gmail: email },
      { phone, address },
      { new: true }
    );

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
