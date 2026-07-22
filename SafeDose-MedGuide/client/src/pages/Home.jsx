import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MessageSquare, AlertTriangle, ShieldCheck, Bookmark, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories for showcase
    api.get('/categories')
      .then(res => {
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories.slice(0, 4));
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 1) {
      try {
        const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.success && res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (name) => {
    navigate(`/medicines?search=${encodeURIComponent(name)}`);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Hero Section with Dynamic Light/Dark Medical Background Image */}
      <div className="home-hero-wrapper">
        <div className="home-hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <section style={{
            textAlign: 'center',
            padding: '90px 20px 70px 20px',
            maxWidth: '840px',
            margin: '0 auto',
          }}>
            <span className="badge badge-otc" style={{ marginBottom: '16px', letterSpacing: '1px' }}>
              ✨ AI-Powered Medical Guide
            </span>
            <h1 style={{
              fontFamily: 'Outfit',
              fontSize: '3.3rem',
              lineHeight: '1.15',
              marginBottom: '20px',
              fontWeight: 800,
              background: 'var(--hero-title-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              Your Intelligent Guide to Safe Medicine Usage
            </h1>
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '40px',
              maxWidth: '640px',
              margin: '0 auto 40px auto'
            }}>
              Instantly check safe dosages, critical drug-to-drug interactions, side effects, and chat with our Gemini-powered AI medical assistant.
            </p>

            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} color="var(--text-dark)" style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search medicines by brand or generic name (e.g., Paracetamol, Ibuprofen)..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ paddingLeft: '48px', height: '52px', borderRadius: '12px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '52px', borderRadius: '12px', padding: '0 24px' }}>
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '60px',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  padding: '8px 0',
                  textAlign: 'left',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}>
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectSuggestion(item.name)}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s ease',
                        borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-color)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-teal-glow)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.name}</strong>
                        <span style={{ color: 'var(--text-dark)', fontSize: '0.8rem', marginLeft: '8px' }}>
                          ({item.genericName})
                        </span>
                      </div>
                      <ChevronRight size={16} color="var(--text-dark)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="container">
        {/* Feature Cards Grid */}
        <section className="grid-cols-3" style={{ margin: '50px 0' }}>
          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)'
            }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>AI Chat Assistant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', flex: 1 }}>
              Have questions about your prescription or safety rules? Chat directly with our Gemini chatbot for empathetic, clear medical information.
            </p>
            <Link to="/ai-chat" className="btn btn-ai" style={{ width: 'fit-content', fontSize: '0.85rem', padding: '8px 16px' }}>
              Start AI Chat
            </Link>
          </div>

          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Interaction Checker</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', flex: 1 }}>
              Check if taking multiple medicines together creates high risk. Safely identify critical drug-to-drug interactions before usage.
            </p>
            <Link to="/medicines" className="btn btn-secondary" style={{ width: 'fit-content', fontSize: '0.85rem', padding: '8px 16px' }}>
              Check Interactions
            </Link>
          </div>

          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Verified Dosages</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5', flex: 1 }}>
              Access precise dosage guides categorized by age, weight, and condition, verified for general safe medical administration.
            </p>
            <Link to="/medicines" className="btn btn-primary" style={{ width: 'fit-content', fontSize: '0.85rem', padding: '8px 16px' }}>
              Browse Guides
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section style={{ margin: '60px 0 40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.6rem', fontFamily: 'Outfit', color: 'var(--text-main)' }}>Featured Categories</h2>
              <Link to="/medicines" style={{ color: 'var(--primary-teal)', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/medicines?category=${cat._id}`}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{
                    fontSize: '2rem',
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--input-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cat.icon || '💊'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>{cat.name}</h4>
                    <p style={{ color: 'var(--text-dark)', fontSize: '0.8rem' }}>{cat.medicineCount || 0} Medicines</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Safety Notice Footer */}
        <div className="glass-panel" style={{
          marginTop: '80px',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px',
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
          borderColor: 'rgba(245, 158, 11, 0.25)'
        }}>
          <AlertTriangle size={28} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: 'var(--warning)', fontSize: '1rem', marginBottom: '6px', fontFamily: 'Outfit' }}>Important Safety Disclaimer</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              All medical information and tools provided by SafeDose MedGuide (including the Gemini AI Chatbot) are intended for general educational purposes only. They do not constitute professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding medical conditions or medications. In case of a medical emergency, contact emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
