import React from 'react';

const Favorites = ({ files, favorites, toggleFavorite }) => {
  if (!favorites || favorites.length === 0) return null;

  return (
    <div className="favorites-section">
      <h3>⭐ Favorite Files</h3>
      <div className="files-grid">
        {files
          .filter(file => favorites.includes(file.id))
          .map(file => (
            <div key={file.id} className="file-card">
              <div className="file-icon">📄</div>
              <div className="file-name">{file.Name}</div>
              <div className="file-actions">
                <button
                  onClick={() => toggleFavorite(file.id)}
                  className="btn btn-primary btn-small"
                >
                  ⭐ Unpin
                </button>
              </div>
            </div>
          ))}
      </div>
      <hr />
    </div>
  );
};

export default Favorites;
