// src/components/Dashboard.jsx - Dashboard Component

import { useState, useEffect } from 'react';
import {
    createFolder,
    getFolders,
    updateFolder,
    deleteFolder,
    searchFolders,
    uploadFile,
    getFilesByFolder,
    searchFiles,
    deleteFile
} from '../services/api';
import '../styles//Dashboard.css';

function Dashboard({ user, userType, onLogout }) {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
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

    useEffect(() => {
        loadFolders();
        if (userType === 'supervisor') {
            setAvailableGroups(user.groups || []);
            setFolderGroupId(user.groups?.[0] || '');
            setFileGroupId(user.groups?.[0] || '');
        } else {
            setAvailableGroups([user.Group_id]);
            setFolderGroupId(user.Group_id);
            setFileGroupId(user.Group_id);
        }
    }, []);

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

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="header">
                <div>
                    <h2>File Management System</h2>
                    <p className="user-info">Welcome, {user.Name} ({userType})</p>
                </div>
                <button className="btn-logout" onClick={onLogout}>
                    Logout
                </button>
            </div>

            {/* Search and Actions Bar */}
            <div className="actions-bar">
                <input
                    type="text"
                    placeholder="Search folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button className="btn-primary" onClick={handleSearch}>
                    Search
                </button>
                <button className="btn-primary" onClick={() => setShowCreateFolder(true)}>
                    New Folder
                </button>
                {selectedFolder && (
                    <button className="btn-secondary" onClick={() => setShowUploadFile(true)}>
                        Upload File
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Folders List */}
                <div className="folders-panel">
                    <h3>Folders</h3>
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
                            className={`folder-item ${selectedFolder?.id === folder.id ? 'selected' : ''}`}
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditFolder(folder);
                                            }}
                                            className="btn-edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFolder(folder.id);
                                            }}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Files List */}
                <div className="files-panel">
                    {selectedFolder ? (
                        <>
                            <h3>Files in "{selectedFolder.Name}"</h3>
                            <div className="files-grid">
                                {files.map((file) => (
                                    <div key={file.id} className="file-card">
                                        <div className="file-icon">📄</div>
                                        <div className="file-name">{file.Name}</div>
                                        <div className="file-info">
                                            {file.Visibility ? '🌐 Public' : '🔒 Private'}
                                        </div>
                                        <div className="file-actions">
                                            <button
                                                onClick={() => handleDownloadFile(file.id)}
                                                className="btn-download"
                                            >
                                                Download
                                            </button>
                                            {file.ownerEmail === user.Gmail && (
                                                <button
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            Select a folder to view files
                        </div>
                    )}
                </div>
            </div>

            {/* Create Folder Modal */}
            {showCreateFolder && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Folder</h3>
                        <form onSubmit={handleCreateFolder}>
                            <div className="form-group">
                                <label>Folder Name</label>
                                <input
                                    type="text"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={folderVisibility}
                                        onChange={(e) => setFolderVisibility(e.target.checked)}
                                    />
                                    Public Folder
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Select Group</label>
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
                                <button type="submit" className="btn-submit">
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateFolder(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload File Modal */}
            {showUploadFile && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Upload File</h3>
                        <form onSubmit={handleUploadFile}>
                            <div className="form-group">
                                <label>File Name</label>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Select File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={fileVisibility}
                                        onChange={(e) => setFileVisibility(e.target.checked)}
                                    />
                                    Public File
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Select Group</label>
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
                                <button type="submit" className="btn-submit">
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadFile(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Folder Modal */}
            {showEditFolder && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit Folder</h3>
                        <form onSubmit={handleUpdateFolder}>
                            <div className="form-group">
                                <label>Folder Name</label>
                                <input
                                    type="text"
                                    value={editFolderName}
                                    onChange={(e) => setEditFolderName(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={editFolderVisibility}
                                        onChange={(e) => setEditFolderVisibility(e.target.checked)}
                                    />
                                    Public Folder
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditFolder(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;