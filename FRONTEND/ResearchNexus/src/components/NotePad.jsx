// src/components/NotePad.jsx
import React, { useState, useEffect } from "react";
import {
  uploadDocument,
  getNotePads,
  createNotePad,
  updateNotePad,
  deleteNotePad
} from "../services/api";
import "../styles/NotePad.css";

const NotePad = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [notePads, setNotePads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState("");

  // Fetch all notePads
  const fetchNotePads = async () => {
    try {
      const res = await getNotePads();
      setNotePads(res.data);
    } catch (err) {
      console.error("Error fetching notePads:", err);
    }
  };

  useEffect(() => {
    fetchNotePads();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!title || !file) return alert("Title and file are required");

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("notes", notes);

    await createNotePad(formData, { headers: { "Content-Type": "multipart/form-data" } });

    setTitle("");
    setFile(null);
    setNotes("");
    fetchNotePads();
  } catch (err) {
    console.error("Error saving notePad:", err);
    alert("Failed to save notePad. Try again.");
  }
};


  const handleEdit = (notePad) => {
    setEditingId(notePad._id);
    setEditNoteContent(notePad.notes);
  };

  const handleUpdate = async (id) => {
    try {
      await updateNotePad(id, { notes: editNoteContent });
      setEditingId(null);
      fetchNotePads();
    } catch (err) {
      console.error("Error updating notePad:", err);
      alert("Failed to update note. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note and document?")) {
      try {
        await deleteNotePad(id);
        fetchNotePads();
      } catch (err) {
        console.error("Error deleting notePad:", err);
        alert("Failed to delete note. Try again.");
      }
    }
  };

  return (
    <div className="notepad-container">
      <h2>Notepad</h2>

      {/* New Note Form */}
      <form onSubmit={handleSubmit} className="notepad-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <textarea
          placeholder="Write your note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>

      {/* Display Notes */}
      <div className="notepad-list">
        {notePads.map((np) => (
          <div key={np._id} className="notepad-entry">
            <h4>{np.title}</h4>
            {np.documentUrl && (
              <a href={np.documentUrl} target="_blank" rel="noreferrer">
                Open Document
              </a>
            )}

            {/* Editable Note Section */}
            {editingId === np._id ? (
              <>
                <textarea
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                />
                <button onClick={() => handleUpdate(np._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>{np.notes || "No notes yet"}</p>
                <button onClick={() => handleEdit(np)}>Edit</button>
                <button onClick={() => handleDelete(np._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotePad;
