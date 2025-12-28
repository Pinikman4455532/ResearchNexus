// routes/routineRoutes.js
const express = require("express");
const router = express.Router();
const {
  getStudentRoutines,
  createRoutine,
  completeRoutine
} = require("../controllers/routineController");

// Get routines for a student
router.get("/:studentEmail", getStudentRoutines);

// Add new routine
router.post("/", createRoutine);

// Mark routine as complete
router.put("/complete/:id", completeRoutine);

module.exports = router;
