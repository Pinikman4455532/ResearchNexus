// server.js - Backend Entry Point with Environment Variables

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Import Routes
const profileRoutes = require('./routes/profileRoutes'); 
const notePadRoutes = require("./routes/notePadRoutes");
const favoriteRoutes = require('./routes/favoriteRoutes');

// shagupta
const routineRoutes = require("./routes/routineRoutes");
const maindashboardRoutes = require("./routes/maindashboardRoutes")
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const taskRoutes = require('./routes/taskRoute');
const progressRoutes = require('./routes/progressRoute');
const previewRoutes = require('./routes/previewRoute');
const announcementRoutes = require('./routes/announcementRoutes');
// Use Routes
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes);

//shagupta

app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/preview', previewRoutes);



app.use("/api/maindashboard", maindashboardRoutes);
app.use("/api/notepads", notePadRoutes);
app.use('/api/announcements', announcementRoutes);

app.use("/api/routines", routineRoutes);

const PORT = process.env.PORT || 9222;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));