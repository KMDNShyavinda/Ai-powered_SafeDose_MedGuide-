import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Camera, Key, Save, Check, AlertCircle, Eye, EyeOff, Sparkles, Upload, Clock, UserCheck } from 'lucide-react';

export default function Profile({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'avatar' | 'security'
  
  // Profile info state
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  
  // Avatar upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Presets avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  ];

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.email?.split('@')[0] || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setRole(user.role?.name || user.role || 'User');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      showToast('success', 'Profile & Username updated successfully!');
      
      const updatedUser = { ...user, ...data.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size must be under 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      let newAvatarUrl = '';

      try {
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const response = await fetch('/api/users/profile/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.success) {
          newAvatarUrl = data.data.user?.avatar || data.data.avatarUrl;
        }
      } catch (uploadErr) {
        console.warn('Multipart upload fallback:', uploadErr);
      }

      // Fallback to Data URL if direct file path wasn't returned
      if (!newAvatarUrl) {
        newAvatarUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(selectedFile);
        });

        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: newAvatarUrl }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.message || 'Failed to save avatar photo');
        }
        newAvatarUrl = resData.data.user?.avatar || newAvatarUrl;
      }

      showToast('success', 'Profile picture updated successfully!');
      setAvatar(newAvatarUrl);
      setPreviewUrl('');
      setSelectedFile(null);

      const updatedUser = { ...user, avatar: newAvatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPresetAvatar = async (presetUrl) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: presetUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to set avatar');
      }

      const savedAvatar = data.data.user?.avatar || presetUrl;
      showToast('success', 'Avatar updated from preset!');
      setAvatar(savedAvatar);
      setPreviewUrl('');
      setSelectedFile(null);

      const updatedUser = { ...user, avatar: savedAvatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      showToast('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '32px' }} className="glass-panel">
        <UserCheck size={48} color="var(--primary-teal)" />
        <h2 style={{ margin: '16px 0 8px' }}>Please Sign In</h2>
        <p style={{ color: 'var(--text-muted)' }}>You must be logged in to view and manage your user profile.</p>
      </div>
    );
  }

  const userInitial = firstName ? firstName[0].toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px 60px' }}>
      
      {/* Toast Alert */}
      {message.text && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
          backdropFilter: 'blur(10px)'
        }}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
          <span style={{ fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {/* Header Banner & Profile Card */}
      <div className="glass-panel" style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '32px',
        border: '1px solid var(--border-color)',
      }}>
        {/* Decorative Top Gradient Banner */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.15) 0%, transparent 60%)'
          }} />
        </div>

        {/* Profile Details Header */}
        <div style={{
          padding: '0 32px 28px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '-50px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            {/* Avatar Circle */}
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '4px solid var(--bg-dark-900)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--primary-teal), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                  {userInitial}
                </span>
              )}

              <button
                onClick={() => setActiveTab('avatar')}
                title="Change Avatar"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer',
                  border: 'none',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <Camera size={24} />
              </button>
            </div>

            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
                {firstName} {lastName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--primary-teal)', fontWeight: 600 }}>
                  @{username || email.split('@')[0]}
                </span>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--primary-teal)',
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}>
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary-teal)" />
              <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 32px 16px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px'
        }}>
          <button
            onClick={() => setActiveTab('info')}
            className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '12px', padding: '8px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={16} />
            Profile & Username
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`btn ${activeTab === 'avatar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '12px', padding: '8px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Camera size={16} />
            Profile Picture
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '12px', padding: '8px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={16} />
            Change Password
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: EDIT PROFILE & USERNAME */}
      {activeTab === 'info' && (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Sparkles color="var(--primary-teal)" size={22} />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Personal Details & Username</h3>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Username (@handle)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-teal)', fontWeight: 700 }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourusername"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 34px',
                      borderRadius: '12px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  This will be displayed as your unique handle.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Email Address (Read-only)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Account Role
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-teal)' }} />
                  <input
                    type="text"
                    value={role}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                      textTransform: 'capitalize',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
              >
                <Save size={18} />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT 2: PROFILE PICTURE / AVATAR */}
      {activeTab === 'avatar' && (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Camera color="var(--primary-teal)" size={22} />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Update Profile Picture</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Custom Upload Section */}
            <div style={{
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--input-border)',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>Upload Custom Photo</h4>
              
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--primary-teal), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--primary-teal-glow)'
              }}>
                {previewUrl || avatar ? (
                  <img src={previewUrl || avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={48} color="#ffffff" />
                )}
              </div>

              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <label
                htmlFor="avatarInput"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px' }}
              >
                <Upload size={16} />
                Choose Image File
              </label>

              {selectedFile && (
                <p style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', margin: '8px 0' }}>
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}

              {selectedFile && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={handleUploadAvatar}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {loading ? 'Uploading...' : 'Save Uploaded Photo'}
                  </button>
                </div>
              )}
            </div>

            {/* Presets Gallery Section */}
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>Or Choose Preset Avatar</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {presetAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPresetAvatar(url)}
                    disabled={loading}
                    style={{
                      padding: 0,
                      borderRadius: '50%',
                      border: avatar === url ? '3px solid var(--primary-teal)' : '2px solid transparent',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      aspectRatio: '1',
                      background: 'none',
                      boxShadow: avatar === url ? '0 0 12px var(--primary-teal-glow)' : 'none',
                      transition: 'transform 0.2s, border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CHANGE PASSWORD */}
      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Key color="var(--primary-teal)" size={22} />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ maxWidth: '520px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
            >
              <Key size={18} />
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
