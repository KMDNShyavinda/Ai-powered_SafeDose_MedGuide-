import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Heart, Shield, LogOut, User, LogIn, FileText, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

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
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="var(--primary-teal)" />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                textDecoration: 'none',
                padding: '4px 12px 4px 4px',
                borderRadius: '24px',
                background: isActive('/profile') ? 'var(--primary-teal-glow)' : 'rgba(255,255,255,0.04)',
                border: isActive('/profile') ? '1px solid var(--primary-teal)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }} 
              title="View & Edit My Profile"
            >
              <div style={{
                width: '36px',
                height: '36px',
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
              <span style={{ fontSize: '0.9rem', color: isActive('/profile') ? 'var(--primary-teal)' : 'var(--text-main)', fontWeight: 600 }}>
                {user.firstName}
              </span>
            </Link>

            <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={14} />
              Logout
            </button>
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
