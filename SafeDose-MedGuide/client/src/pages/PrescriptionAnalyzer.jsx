import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Brain, Bell, Clock, Plus, Trash2, Send, Check, X,
  AlertTriangle, ChevronRight, Camera, PenTool, Pill, ShieldAlert,
  Calendar, CheckCircle2, XCircle, Sparkles, History, Eye
} from 'lucide-react';
import { api } from '../utils/api';

const TABS = [
  { id: 'upload', label: 'Upload / Enter', icon: Upload },
  { id: 'results', label: 'Analysis Results', icon: Brain },
  { id: 'chat', label: 'Ask AI', icon: Sparkles },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'history', label: 'History', icon: History },
];

export default function PrescriptionAnalyzer({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [entryMode, setEntryMode] = useState('upload'); // 'upload' | 'manual'

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Manual entry state
  const [doctorInfo, setDoctorInfo] = useState({ doctorName: '', hospitalName: '', prescriptionDate: '' });
  const [manualMedicines, setManualMedicines] = useState([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  // Analysis state
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [analyzedMedicines, setAnalyzedMedicines] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  // History state
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // General
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // ==================== HANDLERS ====================

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }
    setSelectedFile(file);
    setError('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) { setError('Please select a prescription image.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('prescriptionImage', selectedFile);
      formData.append('doctorName', doctorInfo.doctorName);
      formData.append('hospitalName', doctorInfo.hospitalName);
      formData.append('prescriptionDate', doctorInfo.prescriptionDate);

      const response = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setCurrentPrescription(data.data.prescription);
      setSuccess('Prescription uploaded! Starting AI analysis...');
      await runAnalysis(data.data.prescription._id);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    const validMeds = manualMedicines.filter(m => m.medicineName.trim());
    if (validMeds.length === 0) { setError('Please add at least one medicine.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/prescriptions/manual', {
        ...doctorInfo,
        medicines: validMeds,
      });
      if (!res.success) throw new Error(res.message);

      setCurrentPrescription(res.data.prescription);
      setSuccess('Prescription saved! Starting AI analysis...');
      await runAnalysis(res.data.prescription._id);
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const runAnalysis = async (prescriptionId) => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.post(`/prescriptions/${prescriptionId}/analyze`);
      if (!res.success) throw new Error(res.message);

      setCurrentPrescription(res.data.prescription);
      setAnalyzedMedicines(res.data.medicines || []);
      setSuccess('Analysis complete!');
      setActiveTab('results');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const addManualMedicine = () => {
    setManualMedicines([...manualMedicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeManualMedicine = (idx) => {
    if (manualMedicines.length <= 1) return;
    setManualMedicines(manualMedicines.filter((_, i) => i !== idx));
  };

  const updateManualMedicine = (idx, field, value) => {
    const updated = [...manualMedicines];
    updated[idx][field] = value;
    setManualMedicines(updated);
  };

  // Chat handler
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading || !currentPrescription) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const res = await api.post(`/prescriptions/${currentPrescription._id}/chat`, { message: msg });
      if (res.success) {
        setChatMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: 'Sorry, I could not process your question. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Reminders
  const handleCreateReminders = async () => {
    if (!currentPrescription) return;
    setLoadingReminders(true);
    try {
      const res = await api.post('/reminders/create', { prescriptionId: currentPrescription._id });
      if (res.success) {
        setReminders(res.data.reminders || []);
        setSuccess(`${res.data.reminders?.length || 0} reminder(s) created!`);
        fetchTodaySchedule();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReminders(false);
    }
  };

  const fetchReminders = async () => {
    setLoadingReminders(true);
    try {
      const res = await api.get('/reminders');
      if (res.success) setReminders(res.data.reminders || []);
    } catch (err) { console.error(err); }
    finally { setLoadingReminders(false); }
  };

  const fetchTodaySchedule = async () => {
    try {
      const res = await api.get('/reminders/today');
      if (res.success) setTodaySchedule(res.data.schedule || []);
    } catch (err) { console.error(err); }
  };

  const handleMarkTaken = async (reminderId, time, taken) => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await api.put(`/reminders/${reminderId}/taken`, { date: todayStr, time, taken });
      fetchTodaySchedule();
    } catch (err) { console.error(err); }
  };

  const handleToggleReminder = async (reminderId, isActive) => {
    try {
      await api.put(`/reminders/${reminderId}`, { isActive: !isActive });
      fetchReminders();
    } catch (err) { console.error(err); }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.delete(`/reminders/${reminderId}`);
      fetchReminders();
      fetchTodaySchedule();
    } catch (err) { console.error(err); }
  };

  // History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/prescriptions/history');
      if (res.success) setPrescriptionHistory(res.data.prescriptions || []);
    } catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  const handleViewPrescription = async (id) => {
    try {
      const res = await api.get(`/prescriptions/${id}`);
      if (res.success) {
        setCurrentPrescription(res.data.prescription);
        setAnalyzedMedicines(res.data.prescription.medicines || []);
        setChatMessages([]);
        setActiveTab('results');
      }
    } catch (err) { setError(err.message); }
  };

  const handleDeletePrescription = async (id) => {
    try {
      await api.delete(`/prescriptions/${id}`);
      fetchHistory();
      setSuccess('Prescription deleted.');
    } catch (err) { setError(err.message); }
  };

  // Load data when tabs change
  useEffect(() => {
    if (activeTab === 'reminders') { fetchReminders(); fetchTodaySchedule(); }
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  // ==================== STYLES ====================
  const cardStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(20px)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-dark-800)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '0.75rem',
    color: 'var(--text-dark)',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.5px',
    marginBottom: '6px',
    display: 'block',
  };

  // ==================== RENDER ====================
  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px', marginTop: '20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText color="var(--primary-teal)" size={32} />
          AI Prescription Analyzer
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          Upload or enter your prescription for AI-powered medicine analysis, reminders & guidance.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem' }}>
          <AlertTriangle size={18} /> <span>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem' }}>
          <CheckCircle2 size={18} /> <span>{success}</span>
          <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{
              padding: '10px 20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              borderRadius: '12px',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: UPLOAD / ENTER ==================== */}
      {activeTab === 'upload' && (
        <div>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => setEntryMode('upload')} className={entryMode === 'upload' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
              <Camera size={18} /> Upload Image
            </button>
            <button onClick={() => setEntryMode('manual')} className={entryMode === 'manual' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
              <PenTool size={18} /> Manual Entry
            </button>
          </div>

          {/* Doctor Info (shared) */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--primary-teal)" /> Doctor Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Doctor Name</label>
                <input style={inputStyle} placeholder="Dr. John Smith" value={doctorInfo.doctorName} onChange={e => setDoctorInfo({ ...doctorInfo, doctorName: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Hospital / Clinic</label>
                <input style={inputStyle} placeholder="City General Hospital" value={doctorInfo.hospitalName} onChange={e => setDoctorInfo({ ...doctorInfo, hospitalName: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Prescription Date</label>
                <input type="date" style={inputStyle} value={doctorInfo.prescriptionDate} onChange={e => setDoctorInfo({ ...doctorInfo, prescriptionDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Upload Mode */}
          {entryMode === 'upload' && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', fontSize: '1.1rem' }}>Upload Prescription Image</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s, background 0.3s',
                  background: selectedFile ? 'rgba(6, 182, 212, 0.04)' : 'transparent',
                  borderColor: selectedFile ? 'var(--primary-teal)' : 'var(--border-color)',
                }}
              >
                {filePreview ? (
                  <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', marginBottom: '12px' }} />
                ) : (
                  <Upload size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                )}
                <p style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : 'Drag & drop your prescription image here'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Supports JPG, PNG, PDF (max 5MB)
                </p>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              <button onClick={handleUploadSubmit} disabled={submitting || analyzing} className="btn btn-primary" style={{ marginTop: '20px', padding: '12px 32px', width: '100%', fontSize: '1rem' }}>
                {submitting || analyzing ? '⏳ Processing...' : '🔍 Upload & Analyze'}
              </button>
            </div>
          )}

          {/* Manual Mode */}
          {entryMode === 'manual' && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={18} color="var(--primary-teal)" /> Medicine Details
                </h3>
                <button onClick={addManualMedicine} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              {manualMedicines.map((med, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 600 }}>Medicine #{idx + 1}</span>
                    {manualMedicines.length > 1 && (
                      <button onClick={() => removeManualMedicine(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Medicine Name *</label>
                      <input style={inputStyle} placeholder="e.g. Amoxicillin" value={med.medicineName} onChange={e => updateManualMedicine(idx, 'medicineName', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Dosage</label>
                      <input style={inputStyle} placeholder="e.g. 500mg" value={med.dosage} onChange={e => updateManualMedicine(idx, 'dosage', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Frequency</label>
                      <input style={inputStyle} placeholder="e.g. 3 times per day" value={med.frequency} onChange={e => updateManualMedicine(idx, 'frequency', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration</label>
                      <input style={inputStyle} placeholder="e.g. 5 days" value={med.duration} onChange={e => updateManualMedicine(idx, 'duration', e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={labelStyle}>Special Instructions</label>
                    <input style={inputStyle} placeholder="e.g. Take after meals" value={med.instructions} onChange={e => updateManualMedicine(idx, 'instructions', e.target.value)} />
                  </div>
                </div>
              ))}

              <button onClick={handleManualSubmit} disabled={submitting || analyzing} className="btn btn-primary" style={{ marginTop: '8px', padding: '12px 32px', width: '100%', fontSize: '1rem' }}>
                {submitting || analyzing ? '⏳ Processing...' : '🧠 Save & Analyze with AI'}
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: '20px', padding: '16px 20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--warning)', lineHeight: 1.6 }}>
              <strong>Disclaimer:</strong> This information is for educational purposes only. Always follow your doctor's prescription. AI analysis does not replace professional medical advice.
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ANALYSIS RESULTS ==================== */}
      {activeTab === 'results' && (
        <div>
          {analyzedMedicines.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '64px' }}>
              <Brain size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-muted)' }}>No Analysis Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '8px' }}>Upload or enter a prescription to see AI analysis results here.</p>
              <button onClick={() => setActiveTab('upload')} className="btn btn-primary" style={{ marginTop: '20px', padding: '10px 24px' }}>
                Go to Upload
              </button>
            </div>
          ) : (
            <>
              {/* Prescription header info */}
              {currentPrescription && (
                <div style={{ ...cardStyle, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Prescription</span>
                    <h3 style={{ fontFamily: 'Outfit', marginTop: '4px' }}>
                      {currentPrescription.doctorName ? `Dr. ${currentPrescription.doctorName}` : 'Prescription Analysis'}
                    </h3>
                    {currentPrescription.hospitalName && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{currentPrescription.hospitalName}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 600 }}>{currentPrescription.entryType}</span>
                    <p style={{ color: 'var(--primary-teal)', fontWeight: 600, fontSize: '1.2rem' }}>{analyzedMedicines.length} medicine(s)</p>
                  </div>
                </div>
              )}

              {/* Medicine cards */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {analyzedMedicines.map((med, idx) => (
                  <div key={med._id || idx} style={{ ...cardStyle, borderLeft: '4px solid var(--primary-teal)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', color: 'var(--text-main)' }}>{med.medicineName}</h3>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {med.dosage && <span style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary-teal)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{med.dosage}</span>}
                          {med.frequency && <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{med.frequency}</span>}
                          {med.duration && <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{med.duration}</span>}
                        </div>
                      </div>
                      <Pill size={24} color="var(--primary-teal)" />
                    </div>

                    {med.purpose && (
                      <div style={{ marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>💊 Purpose</h4>
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6 }}>{med.purpose}</p>
                      </div>
                    )}

                    {med.usage && (
                      <div style={{ marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>📋 How to Take</h4>
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6 }}>{med.usage}</p>
                      </div>
                    )}

                    {med.sideEffects && med.sideEffects.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--warning)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>⚠️ Possible Side Effects</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {med.sideEffects.map((se, i) => (
                            <span key={i} style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem' }}>{se}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {med.warnings && med.warnings.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>🚨 Warnings</h4>
                        <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                          {med.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}

                    {med.instructions && (
                      <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(6, 182, 212, 0.06)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 600 }}>📝 Doctor's Instructions: </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{med.instructions}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={handleCreateReminders} disabled={loadingReminders} className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} /> {loadingReminders ? 'Creating...' : 'Create Reminders'}
                </button>
                <button onClick={() => { setChatMessages([]); setActiveTab('chat'); }} className="btn btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'rgba(139, 92, 246, 0.3)', color: 'var(--accent-purple)' }}>
                  <Sparkles size={16} /> Ask AI About Medicines
                </button>
              </div>

              {/* Disclaimer */}
              <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  ⚕️ <strong>Disclaimer:</strong> This information is for educational purposes only. Always follow your doctor's prescription and consult a healthcare professional for personal medical advice.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB 3: ASK AI ==================== */}
      {activeTab === 'chat' && (
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '520px' }}>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-purple)" /> Ask About Your Medicines
          </h3>

          {!currentPrescription ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Brain size={48} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Analyze a prescription first to ask questions about your medicines.</p>
            </div>
          ) : (
            <>
              {/* Suggested questions */}
              {chatMessages.length === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {['Why am I taking this medicine?', 'What are the side effects?', 'Can I take this after food?', 'What if I miss a dose?'].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '20px' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary-teal), #0891b2)' : 'var(--bg-dark-700)', color: msg.role === 'user' ? '#060911' : 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px', background: 'var(--bg-dark-700)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ⏳ Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={e => { e.preventDefault(); handleChatSend(); }} style={{ display: 'flex', gap: '8px' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about your medicines..." style={{ ...inputStyle, flex: 1 }} />
                <button type="submit" disabled={chatLoading} className="btn btn-primary" style={{ padding: '12px 20px' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB 4: REMINDERS ==================== */}
      {activeTab === 'reminders' && (
        <div>
          {/* Today's Schedule */}
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary-teal)" /> Today's Schedule
            </h3>
            {todaySchedule.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No medicines scheduled for today. Create reminders from your prescription analysis.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {todaySchedule.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', background: item.taken ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)', border: `1px solid ${item.taken ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`, borderRadius: '12px', transition: 'all 0.2s' }}>
                    <button onClick={() => handleMarkTaken(item.reminderId, item.time, !item.taken)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                      {item.taken
                        ? <CheckCircle2 size={24} color="var(--success)" />
                        : <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-color)' }} />
                      }
                    </button>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: item.taken ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: item.taken ? 'line-through' : 'none' }}>{item.medicineName}</span>
                      {item.dosage && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{item.dosage}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-teal)', fontFamily: 'monospace' }}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All reminders */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="var(--accent-purple)" /> All Reminders
            </h3>
            {loadingReminders ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : reminders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No reminders set. Analyze a prescription and click "Create Reminders" to get started.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {reminders.map(rem => (
                  <div key={rem._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: rem.isActive ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', opacity: rem.isActive ? 1 : 0.5 }}>
                    <Pill size={20} color="var(--primary-teal)" />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rem.medicineName}</span>
                      {rem.dosage && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>{rem.dosage}</span>}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {rem.reminderTimes.map((t, i) => (
                          <span key={i} style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary-teal)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontFamily: 'monospace' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleToggleReminder(rem._id, rem.isActive)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        {rem.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => handleDeleteReminder(rem._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: HISTORY ==================== */}
      {activeTab === 'history' && (
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--primary-teal)" /> Prescription History
          </h3>
          {loadingHistory ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : prescriptionHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <FileText size={48} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>No prescriptions found. Upload or enter your first prescription.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {prescriptionHistory.map(rx => (
                <div key={rx._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => handleViewPrescription(rx._id)}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: rx.entryType === 'IMAGE' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rx.entryType === 'IMAGE' ? <Camera size={18} color="var(--primary-teal)" /> : <PenTool size={18} color="var(--accent-purple)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {rx.doctorName ? `Dr. ${rx.doctorName}` : `Prescription`}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rx.hospitalName || 'No hospital info'}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(rx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: rx.status === 'analyzed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: rx.status === 'analyzed' ? 'var(--success)' : 'var(--warning)' }}>
                      {rx.status?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 600 }}>{rx.medicineCount} med(s)</span>
                    <button onClick={e => { e.stopPropagation(); handleDeletePrescription(rx._id); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
