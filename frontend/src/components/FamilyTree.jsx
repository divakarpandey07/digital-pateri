import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, ArrowRight, GitMerge, ShieldAlert } from 'lucide-react';

function FamilyTree({ initialResidentId, onClose }) {
  const [currentId, setCurrentId] = useState(initialResidentId);
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResidentDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/v1/residents/${id}`);
      setResident(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load resident family data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentId) {
      fetchResidentDetails(currentId);
    }
  }, [currentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mapping family connections...</p>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--accent)', marginBottom: '12px' }} />
        <p>{error || 'No family data found'}</p>
        {onClose && <button className="btn btn-secondary" onClick={onClose}>Close</button>}
      </div>
    );
  }

  // Group relations
  const parents = resident.relations?.filter(r => ['Father', 'Mother'].includes(r.relationType)) || [];
  const spouses = resident.relations?.filter(r => r.relationType === 'Spouse') || [];
  const siblings = resident.relations?.filter(r => r.relationType === 'Sibling') || [];
  const children = resident.relations?.filter(r => r.relationType === 'Child') || [];

  const handleNodeClick = (rel) => {
    if (rel.relativeId && rel.relativeId._id) {
      setCurrentId(rel.relativeId._id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitMerge size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Family Tree Engine</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            &times;
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        
        {/* Parents Row */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
          {parents.length > 0 ? (
            parents.map(p => (
              <div 
                key={p._id} 
                onClick={() => handleNodeClick(p)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1.5px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '140px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                  {p.relationType}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.relativeId?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.relativeId?.residentId}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No parent records registered</div>
          )}
        </div>

        {/* Connector Line Top */}
        <div style={{ width: '2px', height: '20px', background: 'var(--border)' }}></div>

        {/* Central Node Row (Self + Spouses) */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Main Resident Node */}
          <div style={{
            padding: '16px 24px',
            borderRadius: '16px',
            background: 'var(--primary)',
            color: 'white',
            textAlign: 'center',
            minWidth: '180px',
            boxShadow: '0 4px 12px rgba(4,120,87,0.15)',
            border: '2px solid transparent'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
              <User size={24} />
            </div>
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{resident.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{resident.residentId}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{resident.occupation} | Ward {resident.ward}</div>
          </div>

          {/* Spouses */}
          {spouses.map(s => (
            <div 
              key={s._id} 
              onClick={() => handleNodeClick(s)}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                background: '#fff',
                border: '2px dashed var(--secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: '150px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--secondary)', fontWeight: '600', marginBottom: '4px' }}>
                Spouse
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{s.relativeId?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.relativeId?.residentId}</div>
            </div>
          ))}
        </div>

        {/* Connector Line Bottom */}
        <div style={{ width: '2px', height: '20px', background: 'var(--border)' }}></div>

        {/* Children Row */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {children.length > 0 ? (
            children.map(c => (
              <div 
                key={c._id} 
                onClick={() => handleNodeClick(c)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1.5px solid var(--border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '130px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                  Child
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.relativeId?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.relativeId?.residentId}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No children records registered</div>
          )}
        </div>

        {/* Siblings Section */}
        {siblings.length > 0 && (
          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>Siblings</h4>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {siblings.map(sib => (
                <div 
                  key={sib._id} 
                  onClick={() => handleNodeClick(sib)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'var(--bg-cream)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    minWidth: '120px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{sib.relativeId?.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sib.relativeId?.residentId}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FamilyTree;
