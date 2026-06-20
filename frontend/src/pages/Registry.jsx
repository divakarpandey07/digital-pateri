import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { FilePlus, History, ShieldAlert, Award, FileText, CheckCircle, XCircle } from 'lucide-react';

function Registry() {
  const { villageId, language, user } = useStore();
  const [activeTab, setActiveTab] = useState('apply');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [type, setType] = useState('Birth');
  const [name, setName] = useState('');
  const [dateOfEvent, setDateOfEvent] = useState('');
  const [gender, setGender] = useState('Male');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [spouseName, setSpouseName] = useState('');

  const isAdmin = user?.roles?.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/registry');
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !dateOfEvent) {
      setMessage({ text: 'Please fill in name and date of event.', type: 'error' });
      return;
    }

    setSubmitLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await axios.post('/api/v1/registry', {
        villageId,
        type,
        name,
        dateOfEvent,
        gender,
        fatherName,
        motherName,
        spouseName
      });
      setMessage({ text: 'Application submitted successfully!', type: 'success' });
      // Reset form
      setName('');
      setDateOfEvent('');
      setFatherName('');
      setMotherName('');
      setSpouseName('');
      setTimeout(() => {
        setActiveTab('history');
        setMessage({ text: '', type: '' });
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to submit application', type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAdminAction = async (recordId, status) => {
    try {
      await axios.patch(`/api/v1/registry/${recordId}/status`, { status });
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--accent)" style={{ marginBottom: '15px' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please log in to report births/deaths or approve certificates.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
        <FileText size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
            {language === 'hi' ? 'जन्म और मृत्यु पंजीकरण' : language === 'hn' ? 'Birth & Death Registry' : 'Birth & Death Registry'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Official portal for recording birth and death events in Pateri Gram Panchayat.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '1px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('apply')}
          style={{
            padding: '10px 15px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'apply' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'apply' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem'
          }}
        >
          <FilePlus size={16} /> Submit Application
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 15px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem'
          }}
        >
          <History size={16} /> My Applications
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '10px 15px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'admin' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              marginLeft: 'auto'
            }}
          >
            🛡️ Admin Dashboard
          </button>
        )}
      </div>

      {message.text && (
        <div style={{
          padding: '12px 15px',
          borderRadius: '8px',
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: message.type === 'error' ? '#b91c1c' : '#15803d',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          {message.text}
        </div>
      )}

      {/* Applying */}
      {activeTab === 'apply' && (
        <div className="glass-card" style={{ maxWidth: '600px', padding: '25px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>
            Report Birth/Death Event
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Event Type */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Event Type</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" checked={type === 'Birth'} onChange={() => setType('Birth')} /> Birth (जन्म)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" checked={type === 'Death'} onChange={() => setType('Death')} /> Death (मृत्यु)
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                {type === 'Birth' ? 'Child Name (Optional/Blank if unnamed)' : 'Deceased Person\'s Full Name'}
              </label>
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px' }}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Gender</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'white' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Date of Event</label>
              <input 
                type="date" 
                value={dateOfEvent}
                onChange={(e) => setDateOfEvent(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px' }}
                required
              />
            </div>

            {type === 'Birth' ? (
              <>
                {/* Father */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Father's Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Father Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
                {/* Mother */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Mother's Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Mother Name"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Spouse */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Spouse's Name (If applicable)</label>
                  <input 
                    type="text" 
                    placeholder="Spouse Name"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitLoading}
              style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '0.95rem' }}
            >
              {submitLoading ? 'Submitting...' : 'Submit to Gram Panchayat'}
            </button>
          </form>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No registry records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {records.map(rec => (
                <div key={rec._id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{rec.name}</strong>
                      <span style={{ fontSize: '0.75rem', background: rec.type === 'Birth' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: rec.type === 'Birth' ? '#10b981' : '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Date: {new Date(rec.dateOfEvent).toLocaleDateString()} | Gender: {rec.gender}
                    </div>
                    {rec.registrationNumber && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        Reg Number: {rec.registrationNumber}
                      </div>
                    )}
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: rec.status === 'Approved' ? '#f0fdf4' : rec.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                      color: rec.status === 'Approved' ? '#15803d' : rec.status === 'Rejected' ? '#b91c1c' : '#d97706',
                      border: `1px solid ${rec.status === 'Approved' ? '#bbf7d0' : rec.status === 'Rejected' ? '#fecaca' : '#fef3c7'}`
                    }}>
                      {rec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {activeTab === 'admin' && isAdmin && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px' }}>Pending Approvals Queue</h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : records.filter(r => r.status === 'Pending').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No pending registrations in the queue.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {records.filter(r => r.status === 'Pending').map(rec => (
                <div key={rec._id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{rec.name}</strong>
                      <span style={{ fontSize: '0.75rem', background: rec.type === 'Birth' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: rec.type === 'Birth' ? '#10b981' : '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {rec.type.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Date: {new Date(rec.dateOfEvent).toLocaleDateString()} | Gender: {rec.gender}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                      {rec.type === 'Birth' ? (
                        <span>Father: {rec.fatherName} | Mother: {rec.motherName}</span>
                      ) : (
                        <span>Spouse: {rec.spouseName || 'None'}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleAdminAction(rec._id, 'Approved')}
                      style={{ padding: '8px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleAdminAction(rec._id, 'Rejected')}
                      style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <XCircle size={14} /> Reject
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

export default Registry;
