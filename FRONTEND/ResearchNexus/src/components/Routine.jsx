import React, { useEffect, useState } from "react";
import axios from "axios";

const Routine = () => {
  const [routines, setRoutines] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [error, setError] = useState("");

  // ✅ READ Gmail (NOT email)
  const storedUser = localStorage.getItem("user");
  const studentEmail = storedUser
    ? JSON.parse(storedUser)?.Gmail
    : null;

  // 🔒 Guard
  if (!studentEmail) {
    return (
      <p style={{ color: "red", padding: "20px" }}>
        User not found. Please login again.
      </p>
    );
  }

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9222/api/routines/${studentEmail}`
      );
      setRoutines(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load routines");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    setError("");

    if (!newTask.title || !newTask.dueDate) {
      return setError("Title and due date are required");
    }

    try {
      const res = await axios.post(
        "http://localhost:9222/api/routines",
        {
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          studentEmail
        }
      );

      setRoutines([res.data, ...routines]);
      setNewTask({ title: "", description: "", dueDate: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to add task");
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.put(
        `http://localhost:9222/api/routines/complete/${id}`
      );
      setRoutines(routines.filter(task => task._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to complete task");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>My Routine</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask({ ...newTask, title: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />

        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) =>
            setNewTask({ ...newTask, dueDate: e.target.value })
          }
        />

        <button type="submit">Add Task</button>
      </form>

      {routines.length === 0 ? (
        <p>No pending tasks</p>
      ) : (
        <ul>
          {routines.map(task => (
  <li key={task._id} style={{ marginBottom: "15px" }}>
    <div>
      <strong>{task.title}</strong>
      <p style={{ margin: "4px 0", color: "#555" }}>
        {task.description || "No description"}
      </p>
      <small>
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </small>
    </div>

    <button
      style={{ marginTop: "5px" }}
      onClick={() => completeTask(task._id)}
    >
      Done
    </button>
  </li>
))}

        </ul>
      )}
    </div>
  );
};

export default Routine;
