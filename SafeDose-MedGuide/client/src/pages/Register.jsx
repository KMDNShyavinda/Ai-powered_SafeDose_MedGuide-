import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldAlert, Upload, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Register({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    requestedRole: 'user', // 'user' | 'pharmacist' | 'admin'
    notes: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can upload a maximum of 5 verification documents.');
      return;
    }
    setSelectedFiles(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return setError('Please fill in all required fields');
    }

    if (formData.requestedRole !== 'user' && selectedFiles.length === 0) {
      return setError(`Requesting '${formData.requestedRole}' role requires uploading at least one supporting verification document.`);
    }

    setLoading(true);

    try {
      let response;

      if (formData.requestedRole !== 'user' && selectedFiles.length > 0) {
        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', formData.phone || '');
        data.append('requestedRole', formData.requestedRole);
        data.append('notes', formData.notes || '');

        selectedFiles.forEach((file) => {
          data.append('documents', file);
        });

        response = await fetch('/api/auth/register', {
          method: 'POST',
          body: data,
        });
      } else {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || '',
          }),
        });
      }

      let res;
      try {
        res = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server response error (${response.status}). Please check network connection.`);
      }

      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Registration failed');
      }

      if (res.data) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (res.data.roleRequest) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            onLoginSuccess(res.data.user);
            navigate('/profile');
          }, 2500);
        } else {
          onLoginSuccess(res.data.user);
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to register. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: 'calc(100vh - 120px)', padding: '40px 20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Outfit' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join SafeDose MedGuide for personal medical insights</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            marginBottom: '24px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            padding: '14px 16px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            marginBottom: '24px'
          }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  className="form-input"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  className="form-input"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+94 7X XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-dark)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Requested Role Section */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="requestedRole">Role Request</label>
            <div style={{ position: 'relative' }}>
              <ShieldAlert size={18} color="var(--primary-teal)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                id="requestedRole"
                name="requestedRole"
                className="form-input"
                value={formData.requestedRole}
                onChange={handleChange}
                style={{ paddingLeft: '44px', appearance: 'none', backgroundPosition: 'right 16px center' }}
                disabled={loading}
              >
                <option value="user">Standard User (Instant Access)</option>
                <option value="pharmacist">Request Pharmacist Role (Requires Admin Approval)</option>
                <option value="admin">Request Administrator Role (Requires Admin Approval)</option>
              </select>
            </div>
          </div>

          {/* Verification Documents Upload Section for Elevated Roles */}
          {formData.requestedRole !== 'user' && (
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              marginBottom: '24px',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary-teal)' }}>
                <Info size={18} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Supporting Documents Required</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                To request the <strong>{formData.requestedRole.toUpperCase()}</strong> role, you must upload verification documents (e.g. Pharmacy License, Medical ID, or Official Certification). An Administrator will review your request.
              </p>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="documents" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Upload Verification Files (PDF, Images, DOC) *
                </label>
                <input
                  id="documents"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  multiple
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                  disabled={loading}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-teal)' }}>Selected Files ({selectedFiles.length}):</span>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedFiles.map((file, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                        <FileText size={14} color="var(--primary-teal)" />
                        <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="notes" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Additional Verification Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Provide license registration numbers or additional details for verification..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }} disabled={loading}>
            {loading ? 'Creating Account...' : (formData.requestedRole !== 'user' ? 'Submit Registration & Role Request' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-teal)', textDecoration: 'none', fontWeight: 500 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
