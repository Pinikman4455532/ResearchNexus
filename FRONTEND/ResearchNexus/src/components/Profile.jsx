import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';

function Profile({ user, userType }) {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    getProfile(user.Gmail, userType).then(res => {
      setProfile(res.data);
      setPhone(res.data.phone || '');
      setAddress(res.data.address || '');
    });
  }, [user, userType]);

  const handleUpdate = async () => {
    await updateProfile({
      email: user.Gmail,
      userType,
      phone,
      address
    });
    alert('Profile updated');
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ padding: '30px' }}>
      <h2>Profile</h2>

      <p><b>Name:</b> {profile.Name}</p>
      <p><b>Email:</b> {profile.Gmail}</p>

      {userType === 'student' && (
        <>
          <p><b>Student ID:</b> {profile.studentId}</p>
          <p><b>Group:</b> {profile.Group_id}</p>
        </>
      )}

      <label>Phone</label>
      <input value={phone} onChange={e => setPhone(e.target.value)} />

      <label>Address</label>
      <input value={address} onChange={e => setAddress(e.target.value)} />

      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
}

export default Profile;
