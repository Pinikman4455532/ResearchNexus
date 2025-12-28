import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MainDashboard.css";
import brainImg from "../assets/brain.png";

const MainDashboard = ({ user, userType, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  const studentEmail = user?.email;

  useEffect(() => {
    if (studentEmail) loadDashboard();
    loadAnnouncements();
  }, [studentEmail]);

  // Load user dashboard data
  const loadDashboard = async () => {
    try {
      const res = await axios.get(
        `http://localhost:9222/api/maindashboard/${studentEmail}`
      );
      setDashboardData(res.data.user);
    } catch (err) {
      console.error("Dashboard load error:", err.response?.data || err.message);
    }
  };

  // Load all announcements (central deadline alerts)
  const loadAnnouncements = async () => {
    try {
      const res = await axios.get("http://localhost:9222/api/announcements");
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error("Announcements load error:", err.response?.data || err.message);
    }
  };

  // Calculate days left for a deadline
  const calculateDaysLeft = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="dashboard-container">
      {/* TOP HEADER */}
      <div className="top-header">
        <div className="left-section">
          <h1>Research Nexus</h1>
          <h2>
            Unlock Your Academic
            <br />
            Potential
          </h2>
          <p>A Comprehensive Platform For Academic Mastery</p>
        </div>
        <div className="right-section">
          <img src={brainImg} alt="Brain" className="brain-img" />
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="dashboard-nav">
        <ul>
          <li>
            <Link to="/search">Search & Discover</Link>
          </li>
          <li>
            <Link to="/tools">Research Tool</Link>
          </li>
          <li>
            <Link to="/community">Community</Link>
          </li>
          <li>
            <button className="btn-profile" onClick={() => navigate("/profile")}>
              Profile
            </button>
          </li>
          <li>
            <button onClick={() => navigate("/files")}>File Management</button>
          </li>
          <li>
            <button onClick={() => navigate("/routine")}>Routine</button>
          </li>

          {/* Only visible for authority supervisor */}
          {user?.Gmail === "authority@gmail.com" && (
            <li>
              <button onClick={() => navigate("/create-announcement")}>
                Create Announcement
              </button>
            </li>
          )}

          <li>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* DEADLINE ALERT SECTION */}
      <div className="deadline-section">
        <span className="bell-icon">🔔</span>
        <div className="announcement-list">
          {announcements.length === 0 && <p>No upcoming deadlines.</p>}
          {announcements.map((a) => (
            <div key={a._id} className="announcement-item">
              <strong>{a.title}</strong> - {a.message} <br />
              <small>Only {calculateDaysLeft(a.date)} days left</small>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="feature-section">
        <div className="feature-card">
          <span className="icon">🔍</span>
          <h3>Search And Discover</h3>
          <p>Access millions of journals, papers, and datasets</p>
        </div>
        <div className="feature-card">
          <span className="icon">🛠️</span>
          <h3>Research Tool</h3>
          <p>Citation management and other tools</p>
        </div>
        <div className="feature-card">
          <span className="icon">👥</span>
          <h3>Community and Collaboration</h3>
          <p>Connect with peers, join groups, share knowledge</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <p>About Us</p>
        <p>Support</p>
        <p>Terms</p>
      </footer>
    </div>
  );
};

export default MainDashboard;
