import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MainDashboard from './components/MainDashboard';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import NotePad from './components/NotePad';
import Routine from './components/Routine';
import CreateAnnouncement from './components/CreateAnnouncement';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');

    if (savedUser && savedUserType) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && Object.keys(parsedUser).length > 0) {
          setUser(parsedUser);
          setUserType(savedUserType);
        }
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      }
    }

    setLoaded(true);
  }, []);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  if (!loaded) return null;

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={user ? <Navigate to="/maindashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Auth */}
      <Route
        path="/login"
        element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/maindashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/maindashboard" replace />}
      />

      {/* Dashboards */}
      <Route
        path="/maindashboard"
        element={
          user ? (
            <MainDashboard user={user} userType={userType} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/files"
        element={
          user ? (
            <Dashboard user={user} userType={userType} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={user ? <Profile user={user} userType={userType} /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/notepad"
        element={user ? <NotePad /> : <Navigate to="/login" replace />}
      />

      {/* ✅ ROUTINE (NO PROPS, SAFE) */}
      <Route
        path="/routine"
        element={user ? <Routine /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/create-announcement"
        element={user && user.Gmail === "authority@gmail.com" ? (
          <CreateAnnouncement />
        ) : (
          <Navigate to="/maindashboard" replace />
        )}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
