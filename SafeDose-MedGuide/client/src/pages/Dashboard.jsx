import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit2, Trash2, Eye, Info, Check, X, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = user.role?.name;
    if (role !== 'admin' && role !== 'pharmacist') {
      navigate('/');
    }
  }, [user, navigate]);

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brandName: '',
    description: '',
    category: '',
    manufacturer: '',
    dosageForm: 'tablet',
    prescriptionRequired: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch admin medicines list
      const medRes = await api.get('/medicines/admin/all?limit=100');
      if (medRes.success && medRes.data?.medicines) {
        setMedicines(medRes.data.medicines);
      }

      // Fetch categories
      const catRes = await api.get('/categories');
      if (catRes.success && catRes.data?.categories) {
        setCategories(catRes.data.categories);
      }

      // Fetch manufacturers
      const manRes = await api.get('/manufacturers');
      if (manRes.success && manRes.data?.manufacturers) {
        setManufacturers(manRes.data.manufacturers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role?.name === 'admin' || user.role?.name === 'pharmacist')) {
      fetchDashboardData();
    }
  }, [user]);

  const handleOpenAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      genericName: '',
      brandName: '',
      description: '',
      category: categories[0]?._id || '',
      manufacturer: manufacturers[0]?._id || '',
      dosageForm: 'tablet',
      prescriptionRequired: false,
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEditModal = (med) => {
    setEditId(med._id);
    setFormData({
      name: med.name,
      genericName: med.genericName,
      brandName: med.brandName || '',
      description: med.description,
      category: med.category?._id || med.category || '',
      manufacturer: med.manufacturer?._id || med.manufacturer || '',
      dosageForm: med.dosageForm,
      prescriptionRequired: med.prescriptionRequired,
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.genericName || !formData.description) {
      return setError('Please fill in all required fields');
    }

    try {
      if (editId) {
        // Update
        const res = await api.put(`/medicines/${editId}`, formData);
        if (res.success) {
          setSuccess('Medicine updated successfully');
          setShowModal(false);
          fetchDashboardData();
        }
      } else {
        // Create
        const res = await api.post('/medicines', formData);
        if (res.success) {
          setSuccess('Medicine added successfully');
          setShowModal(false);
          fetchDashboardData();
        }
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this medicine?')) return;
    try {
      const res = await api.delete(`/medicines/${id}`);
      if (res.success) {
        setSuccess('Medicine deactivated successfully');
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Error deleting medicine');
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

  // Analytics Metrics
  const totalMedicines = medicines.length;
  const activeMedicines = medicines.filter(m => m.isActive).length;
  const totalViews = medicines.reduce((sum, m) => sum + (m.viewCount || 0), 0);

  return (
    <>
      <div className="container animate-fade-in" style={{ paddingBottom: '60px', marginTop: '20px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="var(--primary-teal)" size={32} />
            SafeDose Management Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage medicine listings, view access reports, and monitor inventory items.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {/* Analytics Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Total Catalog</span>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--text-main)', marginTop: '8px' }}>{totalMedicines}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Active Listings</span>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--success)', marginTop: '8px' }}>{activeMedicines}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Total Views</span>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--primary-teal)', marginTop: '8px' }}>{totalViews}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Categories Count</span>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--accent-purple)', marginTop: '8px' }}>{categories.length}</h2>
        </div>
      </section>

      {/* Main Inventory Table */}
      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit' }}>Medicine Inventory</h3>
          {success && <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 500 }}>{success}</span>}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                <th style={{ padding: '16px 24px' }}>Name</th>
                <th style={{ padding: '16px 24px' }}>Generic Name</th>
                <th style={{ padding: '16px 24px' }}>Category</th>
                <th style={{ padding: '16px 24px' }}>Type</th>
                <th style={{ padding: '16px 24px' }}>Views</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-main)' }}>{med.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--primary-teal)', fontStyle: 'italic' }}>{med.genericName}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{med.category?.name || 'N/A'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${med.prescriptionRequired ? 'badge-rx' : 'badge-otc'}`} style={{ fontSize: '0.7rem' }}>
                      {med.prescriptionRequired ? 'Rx' : 'OTC'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{med.viewCount || 0}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      color: med.isActive ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {med.isActive ? <Check size={14} /> : <X size={14} />}
                      {med.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => navigate(`/medicines/${med._id}`)} className="btn btn-secondary" style={{ padding: '6px 10px', border: 'none' }} title="View on Site">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleOpenEditModal(med)} className="btn btn-secondary" style={{ padding: '6px 10px', border: 'none' }} title="Edit">
                        <Edit2 size={14} color="var(--primary-teal)" />
                      </button>
                      {med.isActive && (
                        <button onClick={() => handleDelete(med._id)} className="btn btn-secondary" style={{ padding: '6px 10px', border: 'none' }} title="Deactivate">
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>

      {/* Add / Edit Inventory Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '32px', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit' }}>{editId ? 'Modify Medicine Entry' : 'Register New Medicine'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '20px'
              }}>
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="name">Brand Name (Commercial) *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Tylenol"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="genericName">Generic / Chemical Name *</label>
                  <input
                    id="genericName"
                    type="text"
                    name="genericName"
                    className="form-input"
                    placeholder="e.g. Paracetamol"
                    value={formData.genericName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="brandName">Alternate Brand Names (Comma separated)</label>
                <input
                  id="brandName"
                  type="text"
                  name="brandName"
                  className="form-input"
                  placeholder="e.g. Panadol, Calpol"
                  value={formData.brandName}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Medical Indications & Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  placeholder="Explain usage conditions..."
                  value={formData.description}
                  onChange={handleFormChange}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="manufacturer">Manufacturer</label>
                  <select
                    id="manufacturer"
                    name="manufacturer"
                    className="form-input"
                    value={formData.manufacturer}
                    onChange={handleFormChange}
                  >
                    {manufacturers.map(man => (
                      <option key={man._id} value={man._id}>{man.name} ({man.country})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginTop: '10px', marginBottom: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="dosageForm">Dosage Form</label>
                  <select
                    id="dosageForm"
                    name="dosageForm"
                    className="form-input"
                    value={formData.dosageForm}
                    onChange={handleFormChange}
                  >
                    {['tablet', 'capsule', 'syrup', 'injection', 'inhaler', 'ointment', 'drops'].map(form => (
                      <option key={form} value={form}>{form.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id="prescriptionRequired"
                    type="checkbox"
                    name="prescriptionRequired"
                    checked={formData.prescriptionRequired}
                    onChange={handleFormChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-teal)' }}
                  />
                  <label htmlFor="prescriptionRequired" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Prescription Required (Rx)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifySelf: 'end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
