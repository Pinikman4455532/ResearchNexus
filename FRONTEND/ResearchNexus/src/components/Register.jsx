// src/components/Register.jsx
import { useState } from 'react';
import { registerSupervisor, registerStudent } from '../services/api';
import '../styles//Register.css';

function Register({ onBackToLogin }) {
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({
        Name: '',
        Gmail: '',
        Interest: '',
        groups: '',
        SuperVisor: '',
        Group_id: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (userType === 'supervisor') {
                const data = {
                    Name: formData.Name,
                    Gmail: formData.Gmail,
                    Interest: formData.Interest,
                    groups: formData.groups.split(',').map(g => parseInt(g.trim()))
                };
                await registerSupervisor(data);
                setMessage('Supervisor registered successfully! You can now login.');
            } else {
                const data = {
                    Name: formData.Name,
                    Gmail: formData.Gmail,
                    SuperVisor: formData.SuperVisor,
                    Group_id: parseInt(formData.Group_id)
                };
                await registerStudent(data);
                setMessage('Student registered successfully! You can now login.');
            }

            setFormData({
                Name: '',
                Gmail: '',
                Interest: '',
                groups: '',
                SuperVisor: '',
                Group_id: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2 className="register-title">Register New User</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User Type</label>
                        <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                            <option value="student">Student</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="Name" value={formData.Name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email (Gmail)</label>
                        <input type="email" name="Gmail" value={formData.Gmail} onChange={handleChange} required />
                    </div>

                    {userType === 'supervisor' ? (
                        <>
                            <div className="form-group">
                                <label>Research Interest</label>
                                <input type="text" name="Interest" value={formData.Interest} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Groups (comma separated numbers)</label>
                                <input type="text" name="groups" value={formData.groups} onChange={handleChange} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Supervisor Name</label>
                                <input type="text" name="SuperVisor" value={formData.SuperVisor} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Group ID</label>
                                <input type="number" name="Group_id" value={formData.Group_id} onChange={handleChange} required />
                            </div>
                        </>
                    )}

                    {message && <div className="success-box">{message}</div>}
                    {error && <div className="error-box">{error}</div>}

                    <button type="submit" className="btn register-btn">Register</button>
                    <button type="button" onClick={onBackToLogin} className="btn back-btn">
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
