import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Heart, Shield, LogOut, User, LogIn, FileText, Sun, Moon, ChevronDown, Sparkles, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '16px 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-main)' }}>
        <Activity size={28} color="var(--primary-teal)" />
        <span style={{
          fontFamily: 'Outfit',
          fontSize: '1.4rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, var(--text-main), var(--primary-teal))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          SafeDose <span style={{ fontWeight: 400, fontSize: '1.2rem', opacity: 0.8 }}>MedGuide</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/medicines" className={`btn ${isActive('/medicines') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          Browse Medicines
        </Link>
        <Link to="/ai-chat" className={`btn ${isActive('/ai-chat') ? 'btn-ai' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          <MessageSquare size={16} />
          AI Assistant
        </Link>

        {user && (
          <Link to="/prescriptions" className={`btn ${isActive('/prescriptions') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} />
            Rx Analyzer
          </Link>
        )}

        {user && (
          <Link to="/favorites" className={`btn ${isActive('/favorites') ? 'btn-primary' : 'btn-secondary'}`} style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            background: isActive('/favorites') ? 'var(--primary-teal)' : 'transparent',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}>
            <Heart size={16} color={isActive('/favorites') ? '#ffffff' : 'var(--danger)'} fill={isActive('/favorites') ? '#ffffff' : 'none'} />
            Favorites
          </Link>
        )}

        {user && (user.role?.name === 'admin' || user.role?.name === 'pharmacist') && (
          <Link to="/dashboard" className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`} style={{
            padding: '8px 16px',
            fontSize: '0.88rem',
            borderColor: 'var(--border-color)',
          }}>
            <Shield size={16} />
            Dashboard
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* User Avatar Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 4px',
                borderRadius: '24px',
                background: dropdownOpen || isActive('/profile') ? 'var(--primary-teal-glow)' : 'rgba(255,255,255,0.04)',
                border: dropdownOpen || isActive('/profile') ? '1px solid var(--primary-teal)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                color: 'var(--text-main)',
                outline: 'none'
              }}
              title="User menu"
            >
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-teal), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.firstName ? user.firstName[0].toUpperCase() : 'U'
                )}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {user.firstName}
              </span>
              <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.8 }} />
            </button>

            {/* GitHub-style Profile Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '260px',
                background: 'var(--bg-dark-800)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease-out'
              }}>
                {/* Header User Details */}
                <div 
                  onClick={() => handleNavigate('/profile')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-teal), var(--accent-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.firstName ? user.firstName[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      @{user.username || user.email?.split('@')[0]}
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }} />

                {/* Navigation Links */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={() => handleNavigate('/profile')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive('/profile') ? 'var(--primary-teal-glow)' : 'transparent',
                      color: isActive('/profile') ? 'var(--primary-teal)' : 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!isActive('/profile')) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (!isActive('/profile')) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <User size={16} color="var(--primary-teal)" />
                    Your Profile
                  </button>

                  <button
                    onClick={() => handleNavigate('/favorites')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive('/favorites') ? 'var(--primary-teal-glow)' : 'transparent',
                      color: isActive('/favorites') ? 'var(--primary-teal)' : 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!isActive('/favorites')) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (!isActive('/favorites')) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Heart size={16} color="var(--danger)" />
                    My Favorites
                  </button>

                  <button
                    onClick={() => handleNavigate('/prescriptions')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive('/prescriptions') ? 'var(--primary-teal-glow)' : 'transparent',
                      color: isActive('/prescriptions') ? 'var(--primary-teal)' : 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!isActive('/prescriptions')) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (!isActive('/prescriptions')) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <FileText size={16} color="var(--primary-teal)" />
                    Rx Analyzer
                  </button>

                  {(user.role?.name === 'admin' || user.role?.name === 'pharmacist') && (
                    <button
                      onClick={() => handleNavigate('/dashboard')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isActive('/dashboard') ? 'var(--primary-teal-glow)' : 'transparent',
                        color: isActive('/dashboard') ? 'var(--primary-teal)' : 'var(--text-main)',
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => { if (!isActive('/dashboard')) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => { if (!isActive('/dashboard')) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Shield size={16} color="var(--accent-purple)" />
                      Dashboard
                    </button>
                  )}
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }} />

                {/* Appearance Settings */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={toggleTheme}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="var(--primary-teal)" />}
                      <span>Appearance</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {theme}
                    </span>
                  </button>
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }} />

                {/* Sign Out */}
                <div style={{ padding: '6px' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--danger)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} color="var(--danger)" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <LogIn size={14} />
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

