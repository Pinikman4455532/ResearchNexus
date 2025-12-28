// src/components/Register.jsx

import { useState } from 'react';
import { registerSupervisor, registerStudent } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    Name: '',
    Gmail: '',
    Interest: '',
    groups: '',
    SuperVisor: '',
    Group_id: '',
    studentId: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          groups: formData.groups.split(',').map(g => g.trim()),
          phone: formData.phone,
          address: formData.address
        };
        await registerSupervisor(data);
        setMessage('Supervisor registered successfully! Redirecting to login...');
      } else {
        const data = {
          Name: formData.Name,
          Gmail: formData.Gmail,
          SuperVisor: formData.SuperVisor,
          Group_id: parseInt(formData.Group_id),
          studentId: formData.studentId,
          phone: formData.phone,
          address: formData.address
        };
        await registerStudent(data);
        setMessage('Student registered successfully! Redirecting to login...');
      }

      // Clear form after 2s and redirect
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #638ECB 0%, #395886 100%)'
    }}>
      <div style={{
        background: '#F0F3FA',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h2 style={{ color: '#395886', marginBottom: '30px', textAlign: 'center' }}>
          Register New User
        </h2>

        <form onSubmit={handleSubmit}>
          {/* User Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #D5DEEF',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
            />
          </div>

          {/* Gmail */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Email (Gmail)</label>
            <input
              type="email"
              name="Gmail"
              value={formData.Gmail}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
            />
          </div>

          {/* Student / Supervisor fields */}
          {userType === 'supervisor' ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Research Interest</label>
                <input
                  type="text"
                  name="Interest"
                  value={formData.Interest}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Groups (comma separated)</label>
                <input
                  type="text"
                  name="groups"
                  value={formData.groups}
                  onChange={handleChange}
                  placeholder="e.g., 101,102"
                  style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Supervisor Name</label>
                <input
                  type="text"
                  name="SuperVisor"
                  value={formData.SuperVisor}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Group ID</label>
                <input
                  type="number"
                  name="Group_id"
                  value={formData.Group_id}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
                />
              </div>
            </>
          )}

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#395886', fontWeight: '600' }}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #D5DEEF', borderRadius: '6px', fontSize: '16px' }}
            />
          </div>

          {/* Messages */}
          {message && <div style={{ padding: '10px', marginBottom: '15px', background: '#d4edda', color: '#28a745', borderRadius: '6px' }}>{message}</div>}
          {error && <div style={{ padding: '10px', marginBottom: '15px', background: '#f8d7da', color: '#d9534f', borderRadius: '6px' }}>{error}</div>}

          <button type="submit" style={{
            width: '100%', padding: '14px', background: '#638ECB', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px'
          }}>Register</button>

          <button type="button" onClick={() => navigate('/login')} style={{
            width: '100%', padding: '14px', background: '#D5DEEF', color: '#395886',
            border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
          }}>Back to Login</button>

        </form>
      </div>
    </div>
  );
}

export default Register;
