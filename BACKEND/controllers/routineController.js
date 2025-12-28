const Routine = require("../models/Routine");

// Get all tasks for a student
exports.getStudentRoutines = async (req, res) => {
  const { studentEmail } = req.params;
  if (!studentEmail) return res.status(400).json({ error: "Student email is required" });

  try {
    const routines = await Routine.find({ studentEmail, isCompleted: false }).sort({ dueDate: 1 });
    res.status(200).json(routines);
  } catch (err) {
    console.error("Error fetching routines:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Mark task as completed and remove from pending list
exports.completeRoutine = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Task ID is required" });

  try {
    const routine = await Routine.findById(id);
    if (!routine) return res.status(404).json({ error: "Task not found" });

    routine.isCompleted = true;
    await routine.save();
    res.status(200).json({ message: "Task marked as completed", routine });
  } catch (err) {
    console.error("Error completing routine:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Create a new task
exports.createRoutine = async (req, res) => {
  const { title, description, studentEmail, dueDate } = req.body;

  // Validation
  if (!title || !studentEmail || !dueDate) {
    return res.status(400).json({ error: "Title, studentEmail, and dueDate are required" });
  }

  try {
    const newRoutine = new Routine({ title, description, studentEmail, dueDate });
    await newRoutine.save();
    res.status(201).json(newRoutine);
  } catch (err) {
    console.error("Error creating routine:", err.message);
    res.status(500).json({ error: err.message });
  }
};
