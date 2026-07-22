import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, Trash2, Bookmark } from 'lucide-react';
import { api } from '../utils/api';

export default function Favorites({ user }) {
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      if (res.success && res.data?.favorites) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const handleRemoveFavorite = async (medicineId) => {
    try {
      const res = await api.delete(`/favorites/${medicineId}`);
      if (res.success) {
        setFavorites(favorites.filter(f => f.medicine?._id !== medicineId && f.medicine !== medicineId));
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px', marginTop: '20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Heart color="var(--danger)" fill="var(--danger)" size={28} />
          My Saved Medicines
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Quick access to your frequently checked medications and prescriptions.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '16px', minHeight: '300px', padding: '40px' }}>
          <Bookmark size={48} color="var(--text-dark)" />
          <h3 style={{ color: 'var(--text-main)', fontFamily: 'Outfit' }}>No Saved Medicines</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '340px' }}>
            Bookmark medicines by clicking the "Add to Favorites" button on any medicine details page.
          </p>
          <Link to="/medicines" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', marginTop: '10px' }}>
            Explore Directory
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {favorites.map((fav) => {
            const med = fav.medicine;
            if (!med) return null;
            return (
              <div key={fav._id} className="glass-card animate-fade-in" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className={`badge ${med.prescriptionRequired ? 'badge-rx' : 'badge-otc'}`}>
                      {med.prescriptionRequired ? 'Rx' : 'OTC'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {med.category?.name}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px', fontFamily: 'Outfit' }}>
                    {med.name}
                  </h3>
                  <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--primary-teal)', marginBottom: '12px' }}>
                    {med.genericName}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                    Added: {new Date(fav.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button onClick={() => handleRemoveFavorite(med._id)} className="btn btn-secondary" style={{
                    padding: '8px',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--danger)'
                  }} title="Remove">
                    <Trash2 size={16} />
                  </button>
                  <Link to={`/medicines/${med._id}`} className="btn btn-primary" style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Eye size={14} />
                    View Info
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
