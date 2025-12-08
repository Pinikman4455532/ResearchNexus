// src/App.jsx - Main App Component

import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
    }
  }, []);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  return (
    <div>
      {!user ? (
        showRegister ? (
          <Register onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
        )
      ) : (
        <Dashboard user={user} userType={userType} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;