import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Award, Shield, Users, UserCheck, Briefcase, FileText, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function PanchayatLeadership() {
  const { language } = useStore();
  const [leadership, setLeadership] = useState({ mukhiya: null, sarpanch: null, pacsAdhyaksh: null, wardMembers: [], staff: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const res = await axios.get(`${API_BASE}/residents/leadership`);
        setLeadership(res.data.data);
      } catch (err) {
        console.error('Failed to fetch Panchayat leadership roster', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadership();
  }, []);

  const getTranslation = (key) => {
    const dict = {
      title: {
        en: 'Panchayat Leadership & Staff',
        hi: 'पंचायत नेतृत्व और कर्मचारी',
        hn: 'Panchayat Leadership & Staff'
      },
      subtitle: {
        en: 'Meet the verified public representatives and administrative officers of Gram Panchayat Pateri.',
        hi: 'ग्राम पंचायत पतेरी के सत्यापित जनप्रतिनिधियों और प्रशासनिक अधिकारियों से मिलें।',
        hn: 'Gram Panchayat Pateri ke verified public representatives aur administrative officers.'
      },
      executive: {
        en: 'Executive Leadership',
        hi: 'मुख्य कार्यपालक नेतृत्व',
        hn: 'Executive Leadership'
      },
      wards: {
        en: 'Ward Members (Panch)',
        hi: 'वार्ड सदस्य (पंच)',
        hn: 'Ward Members (Panch)'
      },
      staff: {
        en: 'Panchayat Administrative Staff',
        hi: 'पंचायत प्रशासनिक कर्मचारी',
        hn: 'Panchayat Administrative Staff'
      },
      mukhiya: {
        en: 'Mukhiya (Panchayat Head)',
        hi: 'मुखिया (ग्राम प्रधान)',
        hn: 'Mukhiya (Panchayat Head)'
      },
      sarpanch: {
        en: 'Sarpanch (Judicial Head)',
        hi: 'सरपंच (न्यायिक प्रधान)',
        hn: 'Sarpanch (Judicial Head)'
      },
      pacs: {
        en: 'PACS Adhyaksh (Cooperative President)',
        hi: 'पैक्स अध्यक्ष (सहकारी समिति अध्यक्ष)',
        hn: 'PACS Adhyaksh (Cooperative President)'
      },
      wardNo: {
        en: 'Ward No.',
        hi: 'वार्ड संख्या',
        hn: 'Ward No.'
      },
      viewProfile: {
        en: 'View Digital Profile',
        hi: 'डिजिटल प्रोफाइल देखें',
        hn: 'Digital Profile Dekhein'
      },
      loadingText: {
        en: 'Loading leadership directory...',
        hi: 'नेतृत्व सूची लोड हो रही है...',
        hn: 'Leadership directory load ho rahi hai...'
      }
    };
    return dict[key]?.[language] || dict[key]?.['en'];
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spin-animation" style={{ display: 'inline-block', marginBottom: '15px' }}>
          <Shield size={32} color="var(--primary)" />
        </div>
        <p>{getTranslation('loadingText')}</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>
          {getTranslation('title')}
        </h1>
        <p className="text-muted" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.5' }}>
          {getTranslation('subtitle')}
        </p>
      </div>

      {/* 1. Executive Leadership Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-dark)', fontSize: '1.6rem' }}>
          👑 {getTranslation('executive')}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          
          {/* Mukhiya Card */}
          {leadership.mukhiya && (
            <div className="glass-card" style={{ padding: '25px', borderTop: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.05, pointerEvents: 'none' }}>
                <Award size={140} color="var(--primary)" />
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(4, 120, 87, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  🕌
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary)' }}>
                    {getTranslation('mukhiya')}
                  </span>
                  <h3 style={{ margin: '2px 0 4px 0', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
                    {leadership.mukhiya.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                    {language === 'hi' ? 'पिता: ' : 'Father: '} <strong>{leadership.mukhiya.fatherName}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>{language === 'hi' ? 'उम्र: ' : 'Age: '} <strong>{2026 - new Date(leadership.mukhiya.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : 'Years'}</strong></div>
                <div>{language === 'hi' ? 'शिक्षा: ' : 'Education: '} <strong>{leadership.mukhiya.education || 'Graduate'}</strong></div>
                <div>{language === 'hi' ? 'संपर्क: ' : 'Contact: '} <strong>+91 {leadership.mukhiya.mobile || '9473385741'}</strong></div>
              </div>

              <Link 
                to={`/resident/${leadership.mukhiya.residentId}`}
                style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}
              >
                {getTranslation('viewProfile')} <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Sarpanch Card */}
          {leadership.sarpanch && (
            <div className="glass-card" style={{ padding: '25px', borderTop: '4px solid var(--secondary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.05, pointerEvents: 'none' }}>
                <Shield size={140} color="var(--secondary)" />
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  ⚖️
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary)' }}>
                    {getTranslation('sarpanch')}
                  </span>
                  <h3 style={{ margin: '2px 0 4px 0', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
                    {leadership.sarpanch.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                    {language === 'hi' ? 'पिता: ' : 'Father: '} <strong>{leadership.sarpanch.fatherName}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>{language === 'hi' ? 'उम्र: ' : 'Age: '} <strong>{2026 - new Date(leadership.sarpanch.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : 'Years'}</strong></div>
                <div>{language === 'hi' ? 'शिक्षा: ' : 'Education: '} <strong>{leadership.sarpanch.education || 'Intermediate'}</strong></div>
                <div>{language === 'hi' ? 'संपर्क: ' : 'Contact: '} <strong>+91 {leadership.sarpanch.mobile || '9473385742'}</strong></div>
              </div>

              <Link 
                to={`/resident/${leadership.sarpanch.residentId}`}
                style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}
              >
                {getTranslation('viewProfile')} <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* PACS Adhyaksh Card */}
          {leadership.pacsAdhyaksh && (
            <div className="glass-card" style={{ padding: '25px', borderTop: '4px solid #10b981', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.05, pointerEvents: 'none' }}>
                <Users size={140} color="#10b981" />
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  🌾
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary)' }}>
                    {getTranslation('pacs')}
                  </span>
                  <h3 style={{ margin: '2px 0 4px 0', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
                    {leadership.pacsAdhyaksh.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                    {language === 'hi' ? 'पिता: ' : 'Father: '} <strong>{leadership.pacsAdhyaksh.fatherName}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>{language === 'hi' ? 'उम्र: ' : 'Age: '} <strong>{2026 - new Date(leadership.pacsAdhyaksh.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : 'Years'}</strong></div>
                <div>{language === 'hi' ? 'शिक्षा: ' : 'Education: '} <strong>{leadership.pacsAdhyaksh.education || 'Graduate'}</strong></div>
                <div>{language === 'hi' ? 'संपर्क: ' : 'Contact: '} <strong>+91 {leadership.pacsAdhyaksh.mobile || '9473385743'}</strong></div>
              </div>

              <Link 
                to={`/resident/${leadership.pacsAdhyaksh.residentId}`}
                style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}
              >
                {getTranslation('viewProfile')} <ArrowRight size={14} />
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* 2. Ward Members Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-dark)', fontSize: '1.6rem' }}>
          👥 {getTranslation('wards')}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {leadership.wardMembers.map((member) => (
            <div key={member._id} className="glass-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                  👥
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--primary)' }}>{member.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getTranslation('wardNo')} {member.ward}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                <div>{language === 'hi' ? 'उम्र: ' : 'Age: '} <strong>{2026 - new Date(member.dob).getFullYear()}</strong></div>
                <div>{language === 'hi' ? 'पिता: ' : 'Father: '} <strong>{member.fatherName || 'N/A'}</strong></div>
              </div>
              <Link 
                to={`/resident/${member.residentId}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', marginTop: 'auto' }}
              >
                {getTranslation('viewProfile')} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Panchayat Administrative Staff Section */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-serif)', borderBottom: '2px solid var(--accent)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text-dark)', fontSize: '1.6rem' }}>
          💼 {getTranslation('staff')}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {leadership.staff.map((member) => (
            <div key={member._id} className="glass-card" style={{ padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  📜
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>{member.name}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>
                    {member.occupation}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>{language === 'hi' ? 'उम्र: ' : 'Age: '} <strong>{2026 - new Date(member.dob).getFullYear()}</strong></div>
                <div>{language === 'hi' ? 'शिक्षा: ' : 'Education: '} <strong>{member.education || 'Intermediate'}</strong></div>
                <div>{language === 'hi' ? 'संपर्क: ' : 'Contact: '} <strong>+91 {member.mobile || 'N/A'}</strong></div>
              </div>
              <Link 
                to={`/resident/${member.residentId}`}
                style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}
              >
                {getTranslation('viewProfile')} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default PanchayatLeadership;
