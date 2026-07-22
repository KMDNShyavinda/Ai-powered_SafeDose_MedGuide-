import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Eye, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Ban, Heart } from 'lucide-react';
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

export default function Medicines({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [prescriptionRequired, setPrescriptionRequired] = useState(searchParams.get('prescription') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  
  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load Categories on mount
  useEffect(() => {
    api.get('/categories')
      .then(res => {
        if (res.success && res.data?.categories) setCategories(res.data.categories);
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch medicines when filters or page change
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        let queryParams = `?page=${page}&limit=8`;
        if (searchQuery) queryParams += `&search=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory) queryParams += `&category=${selectedCategory}`;
        if (prescriptionRequired !== '') queryParams += `&prescriptionRequired=${prescriptionRequired}`;
        if (sortBy) queryParams += `&sort=${sortBy}`;

        // Wait! The user's backend endpoint for frontend lists is `/medicines` which calls `getMedicines`.
        // Let's verify `getMedicines` query parameter parsing. It parses `category`, `dosageForm`, `prescriptionRequired`, `sort`.
        // If query has `search`, wait! `getMedicines` only searches if we specify it. Let's see: `getMedicines` has:
        // `const { category, dosageForm, prescriptionRequired, sort } = req.query;`
        // Wait, does it support `search`? Let's check `getMedicines` in `medicineController.js`. It does NOT have a regex search for `/medicines`!
        // But wait! `/api/search/medicines?q=abc` is standard for search!
        // Let's check what `searchController.js` offers. Let's find out!
        
        let url = `/medicines${queryParams}`;
        // If we have a searchQuery, we should search via `/search` endpoint or handle it? Let's check `searchController.js` and see what it does.
        // Let's review `/api/search` in `searchRoutes.js` and `searchController.js`.
        
        const res = await api.get(url);
        if (res.success && res.data?.medicines) {
          // If we had a local search, we can filter them on client side if the endpoint doesn't support searching, OR let's check how the endpoint works.
          // Wait! In `medicineController.js`, `getMedicines` does NOT filter by search.
          // But wait, the admin endpoint `getAllMedicinesAdmin` does filter by search:
          // `if (search) query.$or = [ { name: { $regex: search, $options: 'i' } } ... ]`
          // Let's check how the regular user search works. Let's query search endpoint if searchQuery exists!
          let list = res.data.medicines;
          if (searchQuery) {
            const searchRes = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
            if (searchRes.success && searchRes.data?.medicines) {
              list = searchRes.data.medicines;
              setTotalPages(1);
              setTotalItems(list.length);
            }
          } else {
            setTotalPages(res.pagination?.pages || 1);
            setTotalItems(res.pagination?.total || 0);
          }
          
          setMedicines(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();

    // Sync URL search params
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (prescriptionRequired !== '') params.prescription = prescriptionRequired;
    if (sortBy) params.sort = sortBy;
    if (page > 1) params.page = page;
    setSearchParams(params);

  }, [searchQuery, selectedCategory, prescriptionRequired, sortBy, page]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPrescriptionRequired('');
    setSortBy('name');
    setPage(1);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px', marginTop: '20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', marginBottom: '8px' }}>Medicine Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse our catalog, check dosage guidelines, and find warning disclaimers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{ padding: '24px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary-teal)' }}>
              <Filter size={18} />
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 600 }}>Filter Catalog</h3>
            </div>
            
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search name..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  style={{ paddingLeft: '36px', paddingRight: '12px', height: '40px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Category</label>
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                style={{ height: '40px', fontSize: '0.9rem' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Prescription Select */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Prescription Requirements</label>
              <select
                className="form-input"
                value={prescriptionRequired}
                onChange={(e) => { setPrescriptionRequired(e.target.value); setPage(1); }}
                style={{ height: '40px', fontSize: '0.9rem' }}
              >
                <option value="">All Types</option>
                <option value="false">Over the Counter (OTC)</option>
                <option value="true">Prescription Only (Rx)</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Sort By</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  style={{ height: '40px', fontSize: '0.9rem' }}
                >
                  <option value="name">Alphabetical (A-Z)</option>
                  <option value="newest">Newest Additions</option>
                  <option value="popular">Popularity / Views</option>
                </select>
              </div>
            </div>

            <button onClick={handleResetFilters} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Medicines Grid */}
        <main>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 255, 255, 0.05)',
                borderTopColor: 'var(--primary-teal)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : medicines.length === 0 ? (
            <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '16px', minHeight: '350px', padding: '40px' }}>
              <Ban size={48} color="var(--text-dark)" />
              <h3 style={{ color: 'var(--text-main)', fontFamily: 'Outfit' }}>No Medicines Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '360px' }}>
                We couldn't find matches for your selection. Try resetting filters or using different search keywords.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              {/* Grid List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                {medicines.map((med) => (
                  <div key={med._id} className="glass-card animate-fade-in" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '380px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div>
                      {/* Image Thumbnail wrapper */}
                      <div className="med-card-img-wrapper">
                        <img 
                          src={med.image || getFallbackImage(med.dosageForm)} 
                          alt={med.name}
                          className="med-card-img"
                        />
                        {/* Floating Prescription Badge */}
                        <span className={`badge ${med.prescriptionRequired ? 'badge-rx' : 'badge-otc'}`} style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                        }}>
                          {med.prescriptionRequired ? 'Rx Only' : 'OTC'}
                        </span>
                        {/* Floating views badge */}
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          zIndex: 2,
                          fontSize: '0.75rem',
                          color: 'var(--text-main)',
                          backgroundColor: 'rgba(6, 182, 212, 0.25)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          fontWeight: 500,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                        }}>
                          👁️ {med.viewCount || 0}
                        </span>
                      </div>

                      {/* Content block */}
                      <div style={{ padding: '20px 20px 0 20px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '4px', fontFamily: 'Outfit' }}>
                          {med.name}
                        </h3>
                        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--primary-teal)', marginBottom: '10px' }}>
                          {med.genericName}
                        </p>
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: '16px'
                        }}>
                          {med.description || 'No description available for this medication.'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 20px 20px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-dark)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        textTransform: 'capitalize'
                      }}>
                        {med.dosageForm}
                      </span>
                      <Link to={`/medicines/${med._id}`} className="btn btn-secondary" style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderColor: 'rgba(6, 182, 212, 0.2)'
                      }}>
                        <Eye size={14} />
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
