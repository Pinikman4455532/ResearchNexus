import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  searchFolders,
  uploadFile,
  getFilesByFolder,
  searchFiles,
  deleteFile,
  // Task & Progress APIs
  assignTask,
  getTasksByGroup,
  updateProgress,
  // Preview APIs
  sendWorkForPreview,
  getProfessorPreviews,
  giveFeedback,
  getStudentFeedback,
} from '../services/api';
import '../styles/Dashboard.css';

// Favorites component
function Favorites({ files, favorites, toggleFavorite }) {
  const favoriteFiles = files.filter((file) => favorites.includes(file.id));
  if (favoriteFiles.length === 0) return <p>No favorite files</p>;

  return (
    <div className="favorites-section">
      <h3>⭐ Favorites</h3>
      <div className="files-grid">
        {favoriteFiles.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-icon">📄</div>
            <div className="file-name">{file.Name}</div>
            <div className="file-visibility">
              {file.Visibility ? '🌐 Public' : '🔒 Private'}
            </div>
            <div className="file-actions">
              <button
                onClick={() => toggleFavorite(file.id)}
                className="btn btn-secondary btn-small"
              >
                ❌ Remove Favorite
              </button>
              <button
                onClick={() => window.open(`http://localhost:9222/api/files/download/${file.id}`, '_blank')}
                className="btn btn-primary btn-small"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ user, userType }) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [folderName, setFolderName] = useState('');
  const [folderVisibility, setFolderVisibility] = useState(true);
  const [folderGroupId, setFolderGroupId] = useState('');

  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderVisibility, setEditFolderVisibility] = useState(true);

  const [fileName, setFileName] = useState('');
  const [fileVisibility, setFileVisibility] = useState(true);
  const [fileGroupId, setFileGroupId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [availableGroups, setAvailableGroups] = useState([]);

  // Task/Progress/Feedback state
  const [activeTab, setActiveTab] = useState('files');
  const [tasks, setTasks] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [taskGroupId, setTaskGroupId] = useState('');
  const [works, setWorks] = useState([]);
  const [feedbackText, setFeedbackText] = useState({});
  const [studentFeedbacks, setStudentFeedbacks] = useState([]);
  const [workFile, setWorkFile] = useState(null);
  const [professorEmail, setProfessorEmail] = useState('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:9222/api/favorites/${user.Gmail}`);
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
    loadFolders();
    if (userType === 'supervisor') {
      setAvailableGroups(user.groups || []);
      setFolderGroupId(user.groups?.[0] || '');
      setFileGroupId(user.groups?.[0] || '');
      setTaskGroupId(user.groups?.[0] || '');
      loadProfessorWorks();
    } else {
      setAvailableGroups([user.Group_id]);
      setFolderGroupId(user.Group_id);
      setFileGroupId(user.Group_id);
      loadStudentTasks();
      loadStudentFeedbacks();
    }
  }, []);

const toggleFavorite = async (fileId) => {
  try {
    await fetch('http://localhost:9222/api/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: user.Gmail, fileId }),
    });

    setFavorites((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

  const loadFolders = async () => {
    try {
      const response = await getFolders(user.Gmail);
      setFolders(response.data);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadFiles = async (folderId) => {
    try {
      const response = await getFilesByFolder(folderId, user.Gmail);
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await createFolder({
        Name: folderName,
        Visibility: folderVisibility,
        ownerEmail: user.Gmail,
        Group_id: folderGroupId
      });
      setFolderName('');
      setShowCreateFolder(false);
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert(error.response?.data?.message || 'Error creating folder');
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('Name', fileName);
      formData.append('Folder', selectedFolder.id);
      formData.append('Visibility', fileVisibility);
      formData.append('ownerEmail', user.Gmail);
      formData.append('Group_id', fileGroupId);
      formData.append('file', selectedFile);

      await uploadFile(formData);
      setFileName('');
      setSelectedFile(null);
      setShowUploadFile(false);
      loadFiles(selectedFolder.id);
      loadFolders();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Error uploading file');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFolders();
      setSelectedFolder(null);
      setFiles([]);
      return;
    }
    try {
      const folderResponse = await searchFolders(searchQuery, user.Gmail);
      const fileResponse = await searchFiles(searchQuery, user.Gmail);
      
      setFolders(folderResponse.data);
      
      if (fileResponse.data.length > 0) {
        setFiles(fileResponse.data);
        setSelectedFolder({ Name: 'Search Results', id: 'search' });
      } else {
        setFiles([]);
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm('Delete this folder?')) {
      try {
        await deleteFolder(id);
        loadFolders();
        setSelectedFolder(null);
        setFiles([]);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.Name);
    setEditFolderVisibility(folder.Visibility);
    setShowEditFolder(true);
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    try {
      await updateFolder(editingFolder.id, {
        Name: editFolderName,
        Visibility: editFolderVisibility
      });
      setShowEditFolder(false);
      loadFolders();
      if (selectedFolder && selectedFolder.id === editingFolder.id) {
        setSelectedFolder({
          ...editingFolder,
          Name: editFolderName,
          Visibility: editFolderVisibility
        });
      }
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const handleDownloadFile = (fileId) => {
    window.open(`http://localhost:9222/api/files/download/${fileId}`, '_blank');
  };

  const handleDownloadPreviewFile = (filePath) => {
    const fileName = filePath.split('\\').pop().split('/').pop();
    window.open(`http://localhost:9222/api/preview/download/${fileName}`, '_blank');
  };

  const handleViewPreviewFile = (filePath) => {
    const fileName = filePath.split('\\').pop().split('/').pop();
    const fileUrl = `http://localhost:9222/api/preview/download/${fileName}`;
    setPreviewFileUrl(fileUrl);
    setPreviewFileName(fileName);
    setShowFilePreview(true);
  };

  const handleDeleteFile = async (id) => {
    if (window.confirm('Delete this file?')) {
      try {
        await deleteFile(id);
        loadFiles(selectedFolder.id);
        loadFolders();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };
  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    loadFiles(folder.id);
  };
const loadStudentTasks = async () => {
    try {
      const response = await getTasksByGroup(user.Group_id);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleCheckboxChange = async (taskId) => {
    const newCheckedState = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(newCheckedState);

    const newCompletedCount = Object.values(newCheckedState).filter(Boolean).length;
    setCompletedCount(newCompletedCount);

    try {
      await updateProgress({
        group_id: parseInt(user.Group_id),
        student_email: user.Gmail,
        completed_task: newCompletedCount,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      await assignTask({
        Task_name: taskName,
        group_id: parseInt(taskGroupId),
        professor_email: user.Gmail,
      });
      alert('Task assigned successfully!');
      setTaskName('');
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Error assigning task');
    }
  };

  const loadProfessorWorks = async () => {
    try {
      const response = await getProfessorPreviews(user.Gmail);
      setWorks(response.data);
    } catch (error) {
      console.error('Error loading works:', error);
    }
  };

  const handleSubmitFeedback = async (workId) => {
    try {
      await giveFeedback({
        id: workId,
        feedback: feedbackText[workId],
      });
      alert('Feedback submitted successfully!');
      loadProfessorWorks();
      setFeedbackText({ ...feedbackText, [workId]: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  const loadStudentFeedbacks = async () => {
    try {
      const response = await getStudentFeedback(user.Gmail);
      setStudentFeedbacks(response.data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!workFile) {
      alert('Please select a file');
      return;
    }

    if (!professorEmail || !professorEmail.includes('@')) {
      alert('Please enter a valid professor email address (e.g., gra@gmail.com)');
      return;
    }

    const formData = new FormData();
    formData.append('file', workFile);
    formData.append('student_email', user.Gmail);
    formData.append('professor_email', professorEmail);

    try {
      await sendWorkForPreview(formData);
      alert('Work submitted successfully!');
      setWorkFile(null);
      setProfessorEmail('');
      e.target.reset();
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Error submitting work');
    }
  };

  // ... (all other existing functions like handleCreateFolder, handleUploadFile, handleSearch, handleDeleteFolder, handleEditFolder, handleUpdateFolder, handleDownloadFile, handleDeleteFile, handleViewPreviewFile, handleDownloadPreviewFile, loadStudentTasks, handleCheckboxChange, handleAssignTask, loadProfessorWorks, handleSubmitFeedback, loadStudentFeedbacks, handleSubmitWork remain exactly the same)

  const percentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Research Management System</h2>
          <p>Welcome, {user.Name} ({userType})</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => navigate('/notepad')}
          className="nav-tab"
        >
          📝 Notepad
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`nav-tab ${activeTab === 'files' ? 'active' : ''}`}
        >
          📁 Files & Folders
        </button>

        {userType === 'supervisor' ? (
          <>
            <button
              onClick={() => navigate('/notepad')}
              className="nav-tab"
            >
              📝 Notepad
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              📋 Assign Tasks
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`}
            >
              📝 Review Submissions
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              ✓ My Tasks
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
            >
              📤 Submit Work
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`}
            >
              💬 View Feedback
            </button>
            <button
              onClick={() => navigate('/notepad')}
              className="nav-tab"
            ></button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* FILES TAB */}
        {activeTab === 'files' && (
          <>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button onClick={handleSearch} className="btn btn-search">
                Search
              </button>
              <button onClick={() => setShowCreateFolder(true)} className="btn btn-primary">
                New Folder
              </button>
              {selectedFolder && (
                <button onClick={() => setShowUploadFile(true)} className="btn btn-secondary">
                  Upload File
                </button>
              )}
            </div>

            <div className="content-layout">
              <div className="folders-section">
                <h3>Folders</h3>
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className={`folder-item ${selectedFolder?.id === folder.id ? 'active' : ''}`}
                  >
                    <div className="folder-content">
                      <div>
                        <div className="folder-name">📁 {folder.Name}</div>
                        <div className="folder-info">
                          {folder.File} files • {folder.Visibility ? '🌐 Public' : '🔒 Private'} • Group {folder.Group_id}
                        </div>
                      </div>
                      {folder.ownerEmail === user.Gmail && (
                        <div className="folder-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditFolder(folder); }}
                            className="btn btn-primary btn-small"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                            className="btn btn-danger btn-small"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="files-section">
                {selectedFolder ? (
                  <>
                    <h3>Files in "{selectedFolder.Name}"</h3>
                    <div className="files-grid">
                      {files.map((file) => (
                        <div key={file.id} className="file-card">
                          <div className="file-icon">📄</div>
                          <div className="file-name">{file.Name}</div>
                          <div className="file-visibility">
                            {file.Visibility ? '🌐 Public' : '🔒 Private'}
                          </div>
                          <div className="file-actions">
                            <button
                              onClick={() => toggleFavorite(file.id)}
                              className="btn btn-secondary btn-small"
                            >
                              {favorites.includes(file.id) ? '⭐ Unfavorite' : '⭐ Favorite'}
                            </button>
                            <button
                              onClick={() => window.open(`http://localhost:9222/api/files/download/${file.id}`, '_blank')}
                              className="btn btn-primary btn-small"
                            >
                              Download
                            </button>
                            {file.ownerEmail === user.Gmail && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="btn btn-danger btn-small"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Favorites Section */}
                    <Favorites files={files} favorites={favorites} toggleFavorite={toggleFavorite} />
                  </>
                ) : (
                  <div className="empty-state">
                    Select a folder to view files
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* STUDENT TASKS TAB */}
        {activeTab === 'tasks' && userType === 'student' && (
          <div className="task-section">
            <h2>My Tasks</h2>
            
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-label">Weekly Progress</span>
                <span className="progress-text">
                  {completedCount} / {tasks.length} tasks completed
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}>
                  <span className="progress-percentage">{Math.round(percentage)}%</span>
                </div>
              </div>
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <p className="no-tasks">No tasks assigned yet</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <label className="task-checkbox-label">
                      <input
                        type="checkbox"
                        checked={checkedTasks[task._id] || false}
                        onChange={() => handleCheckboxChange(task._id)}
                        className="task-checkbox"
                      />
                      <span className={`task-name ${checkedTasks[task._id] ? 'completed' : ''}`}>
                        {task.Task_name}
                      </span>
                    </label>
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROFESSOR ASSIGN TASKS TAB */}
        {activeTab === 'tasks' && userType === 'supervisor' && (
          <div className="form-section">
            <h2>Assign New Task</h2>
            <form onSubmit={handleAssignTask}>
              <div className="form-group">
                <label className="form-label">Task Name:</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                  placeholder="Enter task name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Select Group:</label>
                <select
                  value={taskGroupId}
                  onChange={(e) => setTaskGroupId(e.target.value)}
                  required
                  className="form-select"
                >
                  {availableGroups.map(group => (
                    <option key={group} value={group}>Group {group}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Assign Task
              </button>
            </form>
          </div>
        )}

        {/* STUDENT SUBMIT WORK TAB */}
        {activeTab === 'submit' && userType === 'student' && (
          <div className="form-section">
            <h2>Submit Work for Preview</h2>
            <form onSubmit={handleSubmitWork}>
              <div className="form-group">
                <label className="form-label">Professor Email:</label>
                <input
                  type="email"
                  value={professorEmail}
                  onChange={(e) => setProfessorEmail(e.target.value)}
                  placeholder="Enter professor email (e.g., gra@gmail.com)"
                  required
                  className="form-input"
                />
                <small style={{ color: '#638ECB', marginTop: '5px', display: 'block' }}>
                  ⚠️ Enter the professor's email address (not name). Example: gra@gmail.com
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Select File:</label>
                <input
                  type="file"
                  onChange={(e) => setWorkFile(e.target.files[0])}
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send for Preview
              </button>
            </form>
          </div>
        )}

        {/* PROFESSOR REVIEW SUBMISSIONS TAB */}
        {activeTab === 'submissions' && userType === 'supervisor' && (
          <div className="task-section">
            <h2>Student Work Submissions</h2>
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #ffc107'
            }}>
              <strong>📧 Your Email:</strong> {user.Gmail}
              <br />
              <small style={{ color: '#856404' }}>
                Students must submit work to this exact email address to appear here.
              </small>
            </div>
            {works.length === 0 ? (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '30px', 
                borderRadius: '8px', 
                textAlign: 'center' 
              }}>
                <p className="no-submissions">No submissions yet</p>
                <small style={{ color: '#6c757d' }}>
                  Make sure students are submitting to: <strong>{user.Gmail}</strong>
                </small>
              </div>
            ) : (
              <div className="work-list">
                {works.map((work) => (
                  <div key={work._id} className="work-card">
                    <div className="work-header">
                      <h3>From: {work.student_email}</h3>
                      <span className="work-date">
                        {new Date(work.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="work-file">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <strong>File:</strong> {work.file.split('\\').pop().split('/').pop()}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => handleViewPreviewFile(work.file)}
                            className="btn btn-primary btn-small"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleDownloadPreviewFile(work.file)}
                            className="btn btn-secondary btn-small"
                          >
                            📥 Download
                          </button>
                        </div>
                      </div>
                    </div>
                    {work.feedback && (
                      <div className="existing-feedback">
                        <strong>Previous Feedback:</strong>
                        <p>{work.feedback}</p>
                      </div>
                    )}
                    <div>
                      <textarea
                        placeholder="Enter your feedback here..."
                        value={feedbackText[work._id] || ''}
                        onChange={(e) => setFeedbackText({ ...feedbackText, [work._id]: e.target.value })}
                        className="form-textarea"
                      />
                      <button
                        onClick={() => handleSubmitFeedback(work._id)}
                        disabled={!feedbackText[work._id]}
                        className="btn btn-primary"
                        style={{ marginTop: '10px' }}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STUDENT VIEW FEEDBACK TAB */}
        {activeTab === 'feedback' && userType === 'student' && (
          <div className="task-section">
            <h2>My Feedback</h2>
            {studentFeedbacks.length === 0 ? (
              <p className="no-feedback">No feedback yet</p>
            ) : (
              <div className="feedback-list">
                {studentFeedbacks.map((item) => (
                  <div key={item._id} className="feedback-card">
                    <div className="feedback-header">
                      <span className="feedback-date">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="feedback-file">
                      <strong>Submitted File:</strong> {item.file}
                    </div>
                    <div className={`feedback-content ${item.feedback ? '' : 'pending'}`}>
                      <strong>Feedback from Professor:</strong>
                      {item.feedback ? (
                        <p className="feedback-text">{item.feedback}</p>
                      ) : (
                        <p className="pending-text">Pending feedback...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateFolder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Folder</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="form-group">
                <label className="form-label">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={folderVisibility}
                    onChange={(e) => setFolderVisibility(e.target.checked)}
                    className="form-checkbox"
                  />
                  Public Folder
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Select Group</label>
                <select
                  value={folderGroupId}
                  onChange={(e) => setFolderGroupId(e.target.value)}
                  required
                  className="form-select"
                >
                  {availableGroups.map(group => (
                    <option key={group} value={group}>Group {group}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Upload File</h3>
            <form onSubmit={handleUploadFile}>
              <div className="form-group">
                <label className="form-label">File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={fileVisibility}
                    onChange={(e) => setFileVisibility(e.target.checked)}
                    className="form-checkbox"
                  />
                  Public File
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Select Group</label>
                <select
                  value={fileGroupId}
                  onChange={(e) => setFileGroupId(e.target.value)}
                  required
                  className="form-select"
                >
                  {availableGroups.map(group => (
                    <option key={group} value={group}>Group {group}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadFile(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditFolder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Folder</h3>
            <form onSubmit={handleUpdateFolder}>
              <div className="form-group">
                <label className="form-label">Folder Name</label>
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={editFolderVisibility}
                    onChange={(e) => setEditFolderVisibility(e.target.checked)}
                    className="form-checkbox"
                  />
                  Public Folder
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditFolder(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="modal-overlay" onClick={() => setShowFilePreview(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '90%', maxHeight: '90vh', width: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>File Preview: {previewFileName}</h3>
              <button
                onClick={() => setShowFilePreview(false)}
                className="btn btn-danger btn-small"
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ maxHeight: '70vh', overflow: 'auto', background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
              {previewFileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                <img 
                  src={previewFileUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                />
              ) : previewFileName.match(/\.(pdf)$/i) ? (
                <iframe
                  src={previewFileUrl}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                  title="PDF Preview"
                />
              ) : previewFileName.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  controls 
                  style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                >
                  <source src={previewFileUrl} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Preview not available for this file type.
                  </p>
                  <button
                    onClick={() => handleDownloadPreviewFile(previewFileName)}
                    className="btn btn-primary"
                  >
                    📥 Download File
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDownloadPreviewFile(previewFileName)}
                className="btn btn-primary"
              >
                📥 Download File
              </button>
              <button
                onClick={() => setShowFilePreview(false)}
                className="btn btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;