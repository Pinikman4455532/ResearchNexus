// src/components/Login.jsx

import { useState } from 'react';
import { login } from '../services/api';
import '../styles/Login.css'; // <-- Import CSS


function Login({ onLogin, onShowRegister }) {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('student');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, userType);
            onLogin(response.data.user, response.data.userType);
        } catch (err) {
            setError('Login failed. User not found.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h2 className="login-title">File Management System</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>User Type</label>
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit" className="btn-primary">
                        Login
                    </button>

                    <button
                        type="button"
                        onClick={onShowRegister}
                        className="btn-secondary"
                    >
                        Register New User
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
