import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Search, UserCheck, Phone, MapPin, Award, X, Users, BookOpen, FileText, Activity } from 'lucide-react';
import FamilyTree from '../components/FamilyTree';

function SearchResident() {
  const { villageId, language, user } = useStore();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [residentId, setResidentId] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals / Drawers state
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [showTreeDrawer, setShowTreeDrawer] = useState(false);
  const [detailResident, setDetailResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const userRole = user?.roles?.[0] || 'Guest'; // fallback to Guest

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        villageId,
        page,
        limit: 8
      });
      if (search) params.append('search', search);
      if (ward) params.append('ward', ward);
      if (houseNo) params.append('houseNo', houseNo);
      if (residentId) params.append('residentId', residentId);
      
      const res = await axios.get(`/api/v1/residents?${params.toString()}`);
      setResidents(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchResidents();
    }
  }, [villageId, page, ward]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResidents();
  };

  const handleClearFilters = () => {
    setSearch('');
    setWard('');
    setHouseNo('');
    setResidentId('');
    setPage(1);
  };

  const openDetails = async (resident) => {
    setDetailResident(resident);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await axios.get(`/api/v1/residents/${resident._id}`);
      setDetailResident(res.data.data);
    } catch (err) {
      console.error('Failed to load full details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openFamilyTree = (resident) => {
    setSelectedResidentId(resident._id);
    setShowTreeDrawer(true);
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <BookOpen size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>
          {language === 'hi' ? 'स्मार्ट नागरिक खोज इंजन' : language === 'hn' ? 'Smart Resident Search Engine' : 'Smart Resident Search'}
        </h1>
      </div>

      <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 15px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'inline-block' }}>
        Current Access Level: <strong style={{ textTransform: 'uppercase' }}>{userRole}</strong>
      </div>

      {/* Advanced Search Form */}
      <div className="glass-card" style={{ marginBottom: '25px', padding: '20px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            
            {/* Search query */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                {language === 'hi' ? 'नाम / व्यवसाय खोजें' : 'Search Name / Occupation'}
              </label>
              <input 
                type="text" 
                placeholder="E.g. Reshad Khan" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Resident ID */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Resident ID (PAT-XXXXXX)
              </label>
              <input 
                type="text" 
                placeholder="E.g. PAT-000001" 
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            {/* House Number */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                House Number (Wxx-Hxx)
              </label>
              <input 
                type="text" 
                placeholder="E.g. W01-H22" 
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Ward */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Ward Number
              </label>
              <select 
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', background: 'white' }}
              >
                <option value="">All Wards</option>
                <option value="01">Ward 01</option>
                <option value="02">Ward 02</option>
                <option value="03">Ward 03</option>
                <option value="04">Ward 04</option>
                <option value="05">Ward 05</option>
              </select>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handleClearFilters}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Clear
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : residents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No residents found matching the search criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {residents.map(res => (
            <div 
              key={res._id} 
              className="glass-card" 
              style={{ 
                padding: '20px', 
                position: 'relative', 
                overflow: 'hidden', 
                borderLeft: `4px solid ${res.verificationStatus === 'deceased' ? 'var(--text-muted)' : 'var(--primary)'}` 
              }}
            >
              {res.verificationStatus === 'deceased' && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#e11d48', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  DECEASED
                </div>
              )}
              {res.panchayatRole && res.panchayatRole !== 'None' && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--secondary)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {res.panchayatRole}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {res.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{res.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.residentId}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Occupation:</span>
                  <span style={{ fontWeight: '500' }}>{res.occupation}</span>
                </div>
                {res.ward && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ward:</span>
                    <span style={{ fontWeight: '500' }}>{res.ward}</span>
                  </div>
                )}
                {res.houseNo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>House No:</span>
                    <span style={{ fontWeight: '500' }}>{res.houseNo}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => openDetails(res)}
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}
                >
                  View Details
                </button>
                <button 
                  onClick={() => openFamilyTree(res)}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Users size={12} /> Family Tree
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            Prev
          </button>
          <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailModal && detailResident && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', background: 'white', padding: '25px', position: 'relative' }}>
            <button 
              onClick={() => setShowDetailModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: 0, marginBottom: '20px' }}>Resident Profile Details</h2>

            {detailLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Name:</strong> <span>{detailResident.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Resident ID:</strong> <span>{detailResident.residentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Father / Husband:</strong> <span>{detailResident.fatherName || 'Not disclosed'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Gender:</strong> <span>{detailResident.gender}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Occupation:</strong> <span>{detailResident.occupation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Ward:</strong> <span>{detailResident.ward || 'Not specified'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>House Number:</strong> <span>{detailResident.houseNo || 'Not specified'}</span>
                </div>

                {/* Privacy limits */}
                {userRole === 'Guest' ? (
                  <div style={{ marginTop: '15px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#b45309' }}>
                    💡 Log in as a resident to view additional details.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>Reputation Badge:</strong> 
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                        {detailResident.reputationPoints >= 300 ? 'Gold Citizen' : detailResident.reputationPoints >= 150 ? 'Silver Citizen' : 'Bronze Citizen'}
                      </span>
                    </div>
                  </>
                )}

                {/* Admin tier */}
                {['Super Admin', 'Panchayat Admin'].includes(userRole) && (
                  <div style={{ marginTop: '15px', border: '1px solid var(--primary)', borderRadius: '8px', padding: '12px', background: 'rgba(4,120,87,0.03)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)', fontSize: '0.85rem' }}>Admin Registry Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                      <div><strong>Mobile:</strong> {detailResident.mobile || 'None'}</div>
                      <div><strong>Aadhaar Last 4:</strong> {detailResident.aadhaarLast4 || 'None'}</div>
                      <div><strong>Ration Card:</strong> {detailResident.rationCardNumber || 'None'}</div>
                      <div><strong>Ayushman Bharat ID:</strong> {detailResident.ayushmanId || 'None'}</div>
                      <div><strong>PM Kisan ID:</strong> {detailResident.pmKisanId || 'None'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family Tree Drawer */}
      {showTreeDrawer && selectedResidentId && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '600px', height: '100%', background: 'white', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}>
            <FamilyTree 
              initialResidentId={selectedResidentId} 
              onClose={() => {
                setShowTreeDrawer(false);
                setSelectedResidentId(null);
              }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default SearchResident;
