// controllers/authController.js - Authentication Controller

const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, userType } = req.body;

    let user;
    if (userType === 'supervisor') {
      user = await Supervisor.findOne({ Gmail: email });
    } else {
      user = await Student.findOne({ Gmail: email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      user: user,
      userType: userType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Supervisor
exports.registerSupervisor = async (req, res) => {
  try {
    const { Name, Interest, Gmail, groups, phone, address} = req.body;
    
    const newSupervisor = new Supervisor({
      Name,
      Interest,
      Gmail,
      groups,
      phone,
      address
    });

    await newSupervisor.save();
    res.status(201).json({ message: 'Supervisor registered', supervisor: newSupervisor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Student
exports.registerStudent = async (req, res) => {
  try {
    const { Name, SuperVisor, Gmail, Group_id ,studentId, phone, address} = req.body;
    
    const newStudent = new Student({
      Name,
      SuperVisor,
      Gmail,
      Group_id,
      studentId,
      phone,
      address
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student registered', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};