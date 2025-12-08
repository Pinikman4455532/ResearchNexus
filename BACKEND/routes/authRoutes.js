// routes/authRoutes.js - Authentication Routes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login Route
router.post('/login', authController.login);

// Register Supervisor Route
router.post('/register/supervisor', authController.registerSupervisor);

// Register Student Route
router.post('/register/student', authController.registerStudent);

module.exports = router;