import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, AlertTriangle, ShieldCheck, HelpCircle, ChevronLeft, Search, Plus } from 'lucide-react';
import { api } from '../utils/api';

const getFallbackImage = (dosageForm) => {
  const fallbacks = {
    'tablet': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    'capsule': 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b8f?q=80&w=600&auto=format&fit=crop',
    'syrup': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'solution': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'suspension': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'drops': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'inhaler': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=600&auto=format&fit=crop',
    'cream': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'ointment': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'gel': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'patch': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'injection': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=600&auto=format&fit=crop',
    'other': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop',
    'powder': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop'
  };
  return fallbacks[dosageForm] || fallbacks['tablet'];
};

export default function MedicineDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [dosages, setDosages] = useState([]);
  const [sideEffects, setSideEffects] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Interaction Checker States
  const [searchQuery, setSearchQuery] = useState('');
  const [otherMedicines, setOtherMedicines] = useState([]);
  const [selectedOtherMedicine, setSelectedOtherMedicine] = useState(null);
  const [interactionResult, setInteractionResult] = useState(null);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  useEffect(() => {
    const fetchMedicineData = async () => {
      setLoading(true);
      try {
        // Fetch Medicine
        const medRes = await api.get(`/medicines/${id}`);
        if (medRes.success && medRes.data?.medicine) {
          setMedicine(medRes.data.medicine);
        } else {
          return navigate('/medicines');
        }

        // Fetch Dosages
        const dosageRes = await api.get(`/dosages/medicine/${id}`);
        if (dosageRes.success && dosageRes.data?.dosages) {
          setDosages(dosageRes.data.dosages);
        }

        // Fetch Side Effects
        const sideRes = await api.get(`/side-effects/medicine/${id}`);
        if (sideRes.success && sideRes.data?.sideEffects) {
          setSideEffects(sideRes.data.sideEffects);
        }

        // Fetch Interactions
        const interRes = await api.get(`/interactions/medicine/${id}`);
        if (interRes.success && interRes.data?.interactions) {
          setInteractions(interRes.data.interactions);
        }

        // Check if Favorite
        if (user) {
          const favRes = await api.get(`/favorites/check/${id}`);
          if (favRes.success) {
            setIsFavorite(favRes.data.isFavorite);
          }
        }
      } catch (err) {
        console.error(err);
        navigate('/medicines');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineData();
  }, [id, user, navigate]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      return navigate('/login');
    }
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { medicineId: id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchOther = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      try {
        const res = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.success && res.data?.suggestions) {
          // Filter out current medicine
          setOtherMedicines(res.data.suggestions.filter(s => s._id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setOtherMedicines([]);
    }
  };

  const handleSelectOther = (med) => {
    setSelectedOtherMedicine(med);
    setSearchQuery('');
    setOtherMedicines([]);
    setInteractionResult(null);
  };

  const handleCheckInteraction = async () => {
    if (!selectedOtherMedicine) return;
    setCheckingInteraction(true);
    try {
      const res = await api.get(`/interactions/check?drugs=${id},${selectedOtherMedicine._id}`);
      if (res.success && res.data?.interactions) {
        if (res.data.interactions.length > 0) {
          setInteractionResult(res.data.interactions[0]);
        } else {
          setInteractionResult({ none: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingInteraction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.05)',
          borderTopColor: 'var(--primary-teal)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!medicine) return null;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', marginTop: '20px' }}>
      <Link to="/medicines" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '24px' }}>
        <ChevronLeft size={16} /> Back to Directory
      </Link>

      {/* Header Info Panel */}
      <section className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Left Column: Image */}
          <div style={{
            width: '240px',
            height: '160px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            flexShrink: 0
          }}>
            <img 
              src={medicine.image || getFallbackImage(medicine.dosageForm)} 
              alt={medicine.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Right Column: Text Info & Action button */}
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span className={`badge ${medicine.prescriptionRequired ? 'badge-rx' : 'badge-otc'}`}>
                  {medicine.prescriptionRequired ? 'Prescription Required (Rx)' : 'Over The Counter (OTC)'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Category: <strong>{medicine.category?.name}</strong>
                </span>
              </div>
              
              <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--text-main)', marginBottom: '4px' }}>
                {medicine.name}
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--primary-teal)', fontStyle: 'italic', marginBottom: '16px' }}>
                Generic Name: {medicine.genericName}
              </p>

              <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Manufacturer: <strong>{medicine.manufacturer?.name} ({medicine.manufacturer?.country})</strong></span>
                <span>•</span>
                <span>Views: <strong>{medicine.viewCount}</strong></span>
              </div>
            </div>

            <button
              onClick={handleFavoriteToggle}
              className="btn btn-secondary"
              style={{
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: isFavorite ? 'var(--danger)' : 'var(--border-color)',
                color: isFavorite ? 'var(--danger)' : 'var(--text-main)',
                backgroundColor: isFavorite ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
              }}
            >
              <Heart size={18} fill={isFavorite ? 'var(--danger)' : 'none'} color="var(--danger)" />
              {isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab System */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side Tab Contents */}
        <main className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '8px' }}>
            {['overview', 'dosage', 'sideEffects', 'interactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab ? 'var(--primary-teal)' : 'var(--text-muted)',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  fontFamily: 'Outfit',
                  borderBottom: activeTab === tab ? '2px solid var(--primary-teal)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'dosage' && `Dosage Guides (${dosages.length})`}
                {tab === 'sideEffects' && `Side Effects (${sideEffects.length})`}
                {tab === 'interactions' && `Interactions (${interactions.length})`}
              </button>
            ))}
          </div>

          {/* Tab Panes */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Outfit' }}>About this Medicine</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{medicine.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '10px' }}>
                <div className="glass-card" style={{ padding: '20px', pointerEvents: 'none' }}>
                  <h4 style={{ color: 'var(--primary-teal)', fontSize: '0.95rem', marginBottom: '8px' }}>Dosage Form</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{medicine.dosageForm}</p>
                </div>
                <div className="glass-card" style={{ padding: '20px', pointerEvents: 'none' }}>
                  <h4 style={{ color: 'var(--primary-teal)', fontSize: '0.95rem', marginBottom: '8px' }}>Brand Names</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{medicine.brandName || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dosage' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dosages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No specific dosage guides registered for this medicine.</p>
              ) : (
                dosages.map((dg) => (
                  <div key={dg._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-otc" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary-teal)' }}>
                        Target: {dg.ageGroup} ({dg.minWeight ? `${dg.minWeight}kg` : ''} {dg.maxWeight ? `- ${dg.maxWeight}kg` : 'any'})
                      </span>
                      <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{dg.dosage}</strong>
                    </div>
                    {dg.frequency && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Frequency: <strong>{dg.frequency}</strong>
                      </p>
                    )}
                    {dg.route && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Administration: <strong>{dg.route}</strong>
                      </p>
                    )}
                    {dg.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '8px' }}>
                        Notes: {dg.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sideEffects' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sideEffects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No recorded side effects cataloged.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {sideEffects.map((se) => (
                    <div key={se._id} className="glass-card" style={{ padding: '20px', borderLeft: `3px solid ${se.frequency === 'common' ? 'var(--danger)' : 'var(--warning)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{se.effect}</h4>
                        <span className="badge" style={{
                          backgroundColor: se.frequency === 'common' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: se.frequency === 'common' ? 'var(--danger)' : 'var(--warning)',
                          fontSize: '0.7rem'
                        }}>
                          {se.frequency}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Severity: {se.severity}</p>
                      {se.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>{se.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Outfit' }}>Critical Interaction Registry</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Known critical reactions when taking this medicine with other compounds.</p>
              </div>

              {interactions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No recorded interaction listings in our database.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {interactions.map((inter) => {
                    const interactingDrug = inter.drugA?._id === id ? inter.drugB : inter.drugA;
                    const isSevere = inter.severity === 'high' || inter.severity === 'critical';
                    return (
                      <div key={inter._id} className="glass-card" style={{ padding: '20px', borderLeft: `3px solid ${isSevere ? 'var(--danger)' : 'var(--warning)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Interacts with: {interactingDrug?.name}</h4>
                          <span className="badge" style={{
                            backgroundColor: isSevere ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: isSevere ? 'var(--danger)' : 'var(--warning)',
                          }}>
                            {inter.severity} risk
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{inter.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Side Compatibility Checker */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--primary-teal)" />
              Compatibility Checker
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Check if taking this medicine with another drug triggers adverse reactions.
            </p>

            {selectedOtherMedicine ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedOtherMedicine.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', display: 'block' }}>{selectedOtherMedicine.genericName}</span>
                  </div>
                  <button onClick={() => setSelectedOtherMedicine(null)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Remove
                  </button>
                </div>

                <button
                  onClick={handleCheckInteraction}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                  disabled={checkingInteraction}
                >
                  {checkingInteraction ? 'Checking...' : 'Check Compatibility'}
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search other medicine..."
                    value={searchQuery}
                    onChange={handleSearchOther}
                    style={{ paddingLeft: '36px', height: '40px', fontSize: '0.85rem' }}
                  />
                </div>

                {otherMedicines.length > 0 && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '4px 0'
                  }}>
                    {otherMedicines.map(med => (
                      <div
                        key={med._id}
                        onClick={() => handleSelectOther(med)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <strong>{med.name}</strong> ({med.genericName})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Results Pane */}
            {interactionResult && (
              <div className="animate-fade-in" style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: interactionResult.none ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${interactionResult.none ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
              }}>
                {interactionResult.none ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.88rem' }}>
                    <ShieldCheck size={18} />
                    <span>No interactions found! These drugs are generally safe to take together.</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>
                      <AlertTriangle size={18} />
                      <span>{interactionResult.severity.toUpperCase()} RISK FOUND!</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {interactionResult.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontFamily: 'Outfit' }}>Need Expert Guidance?</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Our AI chatbot is ready to answer questions about dosages, side effects, and precautions for this medicine.
            </p>
            <Link to={`/ai-chat?medicine=${encodeURIComponent(medicine.name)}`} className="btn btn-ai" style={{ fontSize: '0.82rem', padding: '10px' }}>
              Ask AI about {medicine.name}
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
