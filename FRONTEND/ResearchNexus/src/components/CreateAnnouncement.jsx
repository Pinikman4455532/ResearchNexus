import React, { useState } from "react";
import { createAnnouncement } from "../services/api";

const CreateAnnouncement = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title,
        message,
        date,
        createdBy: "authority@gmail.com" // Only this email is allowed
      });
      alert("Announcement created!");
      setTitle("");
      setMessage("");
      setDate("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to create announcement.");
    }
  };

  return (
    <div className="create-announcement">
      <h2>Create Announcement</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateAnnouncement;
