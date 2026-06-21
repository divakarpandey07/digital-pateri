import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, UserCheck, X, Users, BookOpen, Edit3, Save, Phone, MapPin, Award, Calendar, Briefcase, GraduationCap, Home, ChevronLeft, ChevronRight, ShieldCheck, Plus, Trash2, DropletIcon, AlertCircle } from 'lucide-react';
import FamilyTree from '../components/FamilyTree';
import axios from 'axios';

// Axios instance with token — works on localhost (vite proxy) and production (VITE_API_URL)
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pateri_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const BADGE_CONFIG = {
  Gold: { min: 300, color: '#f59e0b', bg: '#fffbeb', label: '🥇 Gold Citizen' },
  Silver: { min: 150, color: '#64748b', bg: '#f8fafc', label: '🥈 Silver Citizen' },
  Bronze: { min: 0, color: '#b45309', bg: '#fef3c7', label: '🥉 Bronze Citizen' }
};
const getBadge = (pts = 0) => pts >= 300 ? BADGE_CONFIG.Gold : pts >= 150 ? BADGE_CONFIG.Silver : BADGE_CONFIG.Bronze;

const FieldRow = ({ label, value, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
    {Icon && <Icon size={14} style={{ color: 'var(--primary)', marginTop: '3px', flexShrink: 0 }} />}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: '500', color: value ? '#1e293b' : '#94a3b8', fontStyle: value ? 'normal' : 'italic' }}>
        {value || 'Not filled'}
      </div>
    </div>
  </div>
);

function SearchResident() {
  const { villageId, language, user } = useStore();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [residentId, setResidentId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [showTreeDrawer, setShowTreeDrawer] = useState(false);
  const [detailResident, setDetailResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Add new resident (Admin only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', fatherName: '', gender: 'Male', dob: '', ward: '', houseNo: '', occupation: 'Farmer', education: 'Matriculation', bloodGroup: 'O+', mobile: '', address: '' });
  const [addLoading, setAddLoading] = useState(false);

  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
  const isLoggedIn = !!user;

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ villageId, page, limit: 8 });
      if (search) params.append('search', search);
      if (ward) params.append('ward', ward);
      if (houseNo) params.append('houseNo', houseNo);
      if (residentId) params.append('residentId', residentId);
      const res = await api.get(`/residents?${params.toString()}`);
      setResidents(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotalRecords(res.data.data.pagination.totalRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (villageId) fetchResidents(); }, [villageId, page, ward]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchResidents(); };
  const handleClearFilters = () => { setSearch(''); setWard(''); setHouseNo(''); setResidentId(''); setPage(1); };

  const openDetails = async (resident) => {
    setDetailResident(resident);
    setShowDetailModal(true);
    setIsEditing(false);
    setSaveMsg('');
    setDetailLoading(true);
    try {
      const res = await api.get(`/residents/${resident._id}`);
      setDetailResident(res.data.data);
      setEditForm(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMsg('');
    try {
      const res = await api.put(`/residents/${detailResident._id}`, editForm);
      setDetailResident(res.data.data);
      setEditForm(res.data.data);
      setSaveMsg('✅ Profile updated successfully!');
      setIsEditing(false);
      fetchResidents();
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/residents', { ...addForm, villageId });
      setShowAddModal(false);
      setAddForm({ name: '', fatherName: '', gender: 'Male', dob: '', ward: '', houseNo: '', occupation: 'Farmer', education: 'Matriculation', bloodGroup: 'O+', mobile: '', address: '' });
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add resident');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteResident = async (id) => {
    if (!window.confirm('Are you sure? This will soft-delete the resident profile.')) return;
    try {
      await api.delete(`/residents/${id}`);
      setShowDetailModal(false);
      fetchResidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={28} color="var(--primary)" />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>
            {language === 'hi' ? 'स्मार्ट नागरिक खोज' : language === 'hn' ? 'Smart Resident Search' : 'Smart Resident Search'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            background: isAdmin ? 'linear-gradient(135deg, #047857, #065f46)' : isLoggedIn ? 'linear-gradient(135deg, #1d4ed8, #1e40af)' : '#94a3b8',
            color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700'
          }}>
            {isAdmin ? '👑 Super Admin' : isLoggedIn ? '✅ Resident' : '👤 Guest'}
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.83rem' }}>
              <Plus size={15} /> Add Resident
            </button>
          )}
        </div>
      </div>

      {/* Access info banner */}
      {!isLoggedIn && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px 15px', marginBottom: '16px', fontSize: '0.82rem', color: '#b45309', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={15} />
          Login karo to zyada details dekhne ke liye — Father/Husband name, address, mobile, age sab dikhega.
        </div>
      )}

      {/* Search Form */}
      <div className="glass-card" style={{ marginBottom: '25px', padding: '20px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                {language === 'hi' ? 'नाम / व्यवसाय' : 'Name / Occupation'}
              </label>
              <input type="text" placeholder="E.g. Reshad Khan" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Resident ID</label>
              <input type="text" placeholder="PAT-000001" value={residentId} onChange={e => setResidentId(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>House No.</label>
              <input type="text" placeholder="W01-H22" value={houseNo} onChange={e => setHouseNo(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Ward</label>
              <select value={ward} onChange={e => setWard(e.target.value)}
                style={{ width: '100%', padding: '9px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', background: 'white' }}>
                <option value="">All Wards</option>
                {['01','02','03','04','05','06','07','08','09','10','11','12','13','14'].map(w => <option key={w} value={w}>Ward {w}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{totalRecords} residents found</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleClearFilters} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.83rem' }}>Clear</button>
              <button type="submit" className="btn-primary" style={{ padding: '7px 18px', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : residents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <p>Koi resident nahi mila.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px', marginBottom: '30px' }}>
          {residents.map(res => {
            const badge = getBadge(res.reputationPoints);
            const initials = res.name?.slice(0, 2)?.toUpperCase() || '??';
            return (
              <div key={res._id} className="glass-card" style={{
                padding: '18px', position: 'relative', overflow: 'hidden',
                borderLeft: `4px solid ${res.panchayatRole && res.panchayatRole !== 'None' ? 'var(--secondary)' : 'var(--primary)'}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Role Badge */}
                {res.panchayatRole && res.panchayatRole !== 'None' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--secondary)', color: 'white', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '10px', fontWeight: '700' }}>
                    {res.panchayatRole}
                  </div>
                )}
                {res.verificationStatus === 'deceased' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#e11d48', color: 'white', fontSize: '0.65rem', padding: '2px 7px', borderRadius: '10px', fontWeight: '700' }}>
                    DECEASED
                  </div>
                )}

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: res.panchayatRole && res.panchayatRole !== 'None'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, var(--primary), #065f46)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{res.residentId}</p>
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ fontSize: '0.8rem', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>💼 Occupation</span>
                    <span style={{ fontWeight: '500' }}>{res.occupation || '—'}</span>
                  </div>
                  {res.ward && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>📍 Ward</span>
                      <span style={{ fontWeight: '500' }}>Ward {res.ward}</span>
                    </div>
                  )}
                  {res.gender && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>👤 Gender</span>
                      <span style={{ fontWeight: '500' }}>{res.gender}</span>
                    </div>
                  )}
                  {isLoggedIn && res.bloodGroup && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>🩸 Blood</span>
                      <span style={{ fontWeight: '500', color: '#dc2626' }}>{res.bloodGroup}</span>
                    </div>
                  )}
                </div>

                {/* Reputation badge */}
                {isLoggedIn && res.reputationPoints !== undefined && (
                  <div style={{ background: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '12px' }}>
                    {badge.label}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openDetails(res)} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <UserCheck size={12} /> View Details
                  </button>
                  <button onClick={() => { setSelectedResidentId(res._id); setShowTreeDrawer(true); }} className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Users size={12} /> Family Tree
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))} className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            Page {page} / {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(p + 1, totalPages))} className="btn btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ====== DETAIL MODAL ====== */}
      {showDetailModal && detailResident && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #047857, #065f46)', color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {detailResident.name?.slice(0, 2)?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>{detailResident.name}</h2>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '3px' }}>
                  <span>{detailResident.residentId}</span>
                  {detailResident.panchayatRole && detailResident.panchayatRole !== 'None' && <span>• {detailResident.panchayatRole}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {isAdmin && !isEditing && (
                  <button onClick={() => setIsEditing(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                )}
                {isEditing && (
                  <>
                    <button onClick={handleSave} disabled={saveLoading} style={{ background: '#10b981', border: 'none', color: 'white', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                      <Save size={14} /> {saveLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditForm(detailResident); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={() => { setShowDetailModal(false); setIsEditing(false); setSaveMsg(''); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Save Message */}
            {saveMsg && (
              <div style={{ padding: '8px 24px', background: saveMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', fontSize: '0.82rem', color: saveMsg.startsWith('✅') ? '#065f46' : '#dc2626', borderBottom: '1px solid #f1f5f9' }}>
                {saveMsg}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              {detailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <>
                  {/* Reputation Badge */}
                  {isLoggedIn && detailResident.reputationPoints !== undefined && (() => {
                    const badge = getBadge(detailResident.reputationPoints);
                    return (
                      <div style={{ background: badge.bg, color: badge.color, fontWeight: '700', padding: '8px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <span>{badge.label}</span>
                        <span style={{ fontSize: '0.75rem' }}>{detailResident.reputationPoints || 0} points</span>
                      </div>
                    );
                  })()}

                  {/* Section: Basic Info */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>📋 Basic Information</h4>

                    {isEditing ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { label: 'Full Name', field: 'name', type: 'text' },
                          { label: 'Father / Husband Name', field: 'fatherName', type: 'text' },
                          { label: 'Date of Birth', field: 'dob', type: 'date' },
                          { label: 'Ward Number', field: 'ward', type: 'text' },
                          { label: 'House Number', field: 'houseNo', type: 'text' },
                          { label: 'Address', field: 'address', type: 'text' },
                          { label: 'Mohalla', field: 'mohalla', type: 'text' },
                          { label: 'Mobile', field: 'mobile', type: 'text' },
                        ].map(({ label, field, type }) => (
                          <div key={field}>
                            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>{label}</label>
                            <input type={type} value={field === 'dob' ? (editForm[field] ? editForm[field].slice(0, 10) : '') : (editForm[field] || '')}
                              onChange={e => handleEditChange(field, e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                        {/* Gender select */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Gender</label>
                          <select value={editForm.gender || ''} onChange={e => handleEditChange('gender', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}>
                            <option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                        {/* Blood Group */}
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Blood Group</label>
                          <select value={editForm.bloodGroup || ''} onChange={e => handleEditChange('bloodGroup', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}>
                            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px' }}>
                        <FieldRow label="Father / Husband" value={detailResident.fatherName} icon={Users} />
                        <FieldRow label="Gender" value={detailResident.gender} icon={UserCheck} />
                        <FieldRow label="Date of Birth" value={detailResident.dob ? `${new Date(detailResident.dob).toLocaleDateString('en-IN')} (Age: ${calcAge(detailResident.dob)} yrs)` : null} icon={Calendar} />
                        <FieldRow label="Ward" value={detailResident.ward ? `Ward ${detailResident.ward}` : null} icon={MapPin} />
                        <FieldRow label="House Number" value={detailResident.houseNo} icon={Home} />
                        <FieldRow label="Address" value={detailResident.address} icon={MapPin} />
                        <FieldRow label="Mohalla" value={detailResident.mohalla} icon={MapPin} />
                        {isLoggedIn && <FieldRow label="Mobile" value={detailResident.mobile} icon={Phone} />}
                        <FieldRow label="Blood Group" value={detailResident.bloodGroup} icon={DropletIcon} />
                      </div>
                    )}
                  </div>

                  {/* Section: Professional Info */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>💼 Professional Info</h4>
                    {isEditing ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                          { label: 'Occupation', field: 'occupation' },
                          { label: 'Education', field: 'education' },
                          { label: 'Skills (comma separated)', field: 'skills' },
                          { label: 'Panchayat Role', field: 'panchayatRole' },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>{label}</label>
                            <input type="text" value={Array.isArray(editForm[field]) ? editForm[field].join(', ') : (editForm[field] || '')}
                              onChange={e => handleEditChange(field, field === 'skills' ? e.target.value.split(',').map(s => s.trim()) : e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px' }}>
                        <FieldRow label="Occupation" value={detailResident.occupation} icon={Briefcase} />
                        <FieldRow label="Education" value={detailResident.education} icon={GraduationCap} />
                        <FieldRow label="Panchayat Role" value={detailResident.panchayatRole !== 'None' ? detailResident.panchayatRole : null} icon={Award} />
                        {detailResident.skills?.length > 0 && (
                          <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Skills</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {detailResident.skills.map((s, i) => (
                                <span key={i} style={{ background: 'rgba(4,120,87,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section: Admin Only — Govt IDs */}
                  {isAdmin && (
                    <div style={{ marginBottom: '20px', border: '1.5px solid #047857', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, rgba(4,120,87,0.08), rgba(4,120,87,0.02))', padding: '10px 16px', borderBottom: '1px solid rgba(4,120,87,0.1)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} /> Admin Registry — Govt IDs & Sensitive Data
                        </h4>
                      </div>
                      <div style={{ padding: '12px 16px' }}>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                              { label: 'Aadhaar Last 4', field: 'aadhaarLast4' },
                              { label: 'Voter ID (EPIC)', field: 'voterId' },
                              { label: 'Ration Card Number', field: 'rationCardNumber' },
                              { label: 'Card Type (BPL/APL etc)', field: 'cardType' },
                              { label: 'FPS Dealer', field: 'fpsDealer' },
                              { label: 'Family ID', field: 'familyId' },
                              { label: 'Emergency Contact', field: 'emergencyContact' },
                              { label: 'Reputation Points', field: 'reputationPoints' },
                            ].map(({ label, field }) => (
                              <div key={field}>
                                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>{label}</label>
                                <input type="text" value={editForm[field] || ''}
                                  onChange={e => handleEditChange(field, e.target.value)}
                                  style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                              </div>
                            ))}
                            {/* Verification Status */}
                            <div>
                              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Verification Status</label>
                              <select value={editForm.verificationStatus || 'verified'} onChange={e => handleEditChange('verificationStatus', e.target.value)}
                                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="deceased">Deceased</option>
                              </select>
                            </div>
                            {/* Public Profile toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                              <input type="checkbox" id="pubProfile" checked={!!editForm.isPublicProfile} onChange={e => handleEditChange('isPublicProfile', e.target.checked)} />
                              <label htmlFor="pubProfile" style={{ fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>Public Profile</label>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                            <FieldRow label="Resident ID" value={detailResident.residentId} />
                            <FieldRow label="Voter ID (EPIC)" value={detailResident.voterId} />
                            <FieldRow label="Aadhaar Last 4" value={detailResident.aadhaarLast4} />
                            <FieldRow label="Ration Card" value={detailResident.rationCardNumber} />
                            <FieldRow label="Card Type" value={detailResident.cardType} />
                            <FieldRow label="FPS Dealer" value={detailResident.fpsDealer} />
                            <FieldRow label="Family ID" value={detailResident.familyId} />
                            <FieldRow label="Emergency Contact" value={detailResident.emergencyContact} />
                            <FieldRow label="Reputation Pts" value={detailResident.reputationPoints?.toString()} />
                            <FieldRow label="Profile Status" value={detailResident.isPublicProfile ? '✅ Public' : '🔒 Private'} />
                            <FieldRow label="Verification" value={detailResident.verificationStatus} />
                          </div>
                        )}

                        {/* Delete Button (Admin only) */}
                        {!isEditing && (
                          <div style={{ marginTop: '14px', borderTop: '1px solid rgba(4,120,87,0.1)', paddingTop: '12px' }}>
                            <button onClick={() => handleDeleteResident(detailResident._id)}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                              <Trash2 size={13} /> Soft Delete Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest message */}
                  {!isLoggedIn && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px 16px', fontSize: '0.82rem', color: '#b45309', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>Login karo to Father/Husband name, mobile, address, age aur aur bhi details dekhne ke liye.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== ADD RESIDENT MODAL (Admin only) ====== */}
      {showAddModal && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', color: 'white', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Add New Resident</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddResident} style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name *', field: 'name', type: 'text', required: true },
                  { label: 'Father / Husband Name', field: 'fatherName', type: 'text' },
                  { label: 'Date of Birth', field: 'dob', type: 'date' },
                  { label: 'Ward Number *', field: 'ward', type: 'text', required: true },
                  { label: 'House Number', field: 'houseNo', type: 'text' },
                  { label: 'Mobile', field: 'mobile', type: 'text' },
                  { label: 'Address', field: 'address', type: 'text' },
                  { label: 'Occupation', field: 'occupation', type: 'text' },
                  { label: 'Education', field: 'education', type: 'text' },
                ].map(({ label, field, type, required }) => (
                  <div key={field}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '3px' }}>{label}</label>
                    <input type={type} required={required} value={addForm[field] || ''} onChange={e => setAddForm(p => ({ ...p, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Gender *</label>
                  <select value={addForm.gender} onChange={e => setAddForm(p => ({ ...p, gender: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '3px' }}>Blood Group</label>
                  <select value={addForm.bloodGroup} onChange={e => setAddForm(p => ({ ...p, bloodGroup: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" disabled={addLoading} className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.85rem' }}>
                  {addLoading ? 'Adding...' : 'Add Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Family Tree Drawer */}
      {showTreeDrawer && selectedResidentId && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '600px', height: '100%', background: 'white', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}>
            <FamilyTree initialResidentId={selectedResidentId} onClose={() => { setShowTreeDrawer(false); setSelectedResidentId(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResident;
