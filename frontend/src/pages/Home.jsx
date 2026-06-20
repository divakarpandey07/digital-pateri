import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import MapViewer from '../components/MapViewer';
import { Users, FileText, AlertTriangle, Heart, Calendar, Briefcase, ChevronRight, Award, History, CloudSun, Megaphone } from 'lucide-react';
import { translations } from '../utils/translations';

function Home() {
  const { 
    statistics, fetchNotices, notices, 
    fetchComplaints, complaints, fetchJobs, jobs,
    villageId, language
  } = useStore();

  const updatesRef = useRef(null);

  useEffect(() => {
    if (villageId) {
      fetchNotices();
      fetchComplaints();
      fetchJobs();
    }
  }, [villageId]);

  useEffect(() => {
    const el = updatesRef.current;
    if (!el) return;
    let timer = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        el.scrollTop = 0;
      } else {
        el.scrollTop += 1;
      }
    }, 45);
    return () => clearInterval(timer);
  }, [notices]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* 1. HERO BANNER */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">{translations[language]?.home_welcome || 'Welcome to Digital Pateri'}</h1>
          <p className="hero-subtitle">
            {translations[language]?.home_subtitle || '"Connecting People, Preserving Heritage, Empowering Future"'}
          </p>
          <div className="hero-actions">
            <Link to="/directory" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {translations[language]?.nav_directory || 'Explore Village Directory'} <ChevronRight size={16} />
            </Link>
            <Link to="/complaints" className="btn-outline">
              {translations[language]?.comp_new_btn || 'File a Complaint'}
            </Link>
          </div>

          {/* Live Notice Ticker Board */}
          {notices.length > 0 && (
            <div className="glass-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 20px', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.2)', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
              <Megaphone size={20} color="var(--secondary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <strong style={{ color: 'var(--secondary)' }}>{translations[language]?.home_announcements || 'Notice'}:</strong> {notices[0].title} - {notices[0].content.substring(0, 100)}...
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. DYNAMIC COUNTERS & TODAY WIDGET */}
      <section style={{ padding: 'var(--spacing-lg) 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Live Counters */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ marginBottom: '15px' }}>{translations[language]?.home_announcements ? (language === 'hi' ? 'पतेरी लाइव आँकड़े' : language === 'hn' ? 'Pateri Live Stats' : 'Pateri Live Statistics') : 'Pateri Live Statistics'}</h3>
              <div className="stats-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="stat-card" style={{ background: 'var(--bg-cream)', borderRadius: '8px', padding: '10px' }}>
                  <Users size={20} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                  <div className="stat-num" style={{ fontSize: '1.4rem' }}>{statistics?.totalResidents || 2588}</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem' }}>{translations[language]?.home_stats_residents || 'Residents'}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-cream)', borderRadius: '8px', padding: '10px' }}>
                  <FileText size={20} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                  <div className="stat-num" style={{ fontSize: '1.4rem' }}>{statistics?.totalFamilies || 280}</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem' }}>{translations[language]?.home_stats_businesses ? (language === 'hi' ? 'परिवार' : language === 'hn' ? 'Parivar' : 'Families') : 'Families'}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-cream)', borderRadius: '8px', padding: '10px' }}>
                  <Heart size={20} color="#dc2626" style={{ margin: '0 auto 4px' }} />
                  <div className="stat-num" style={{ fontSize: '1.4rem' }}>{statistics?.totalDonors || 45}</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem' }}>{translations[language]?.home_stats_blood || 'Blood Donors'}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--bg-cream)', borderRadius: '8px', padding: '10px' }}>
                  <AlertTriangle size={20} color="var(--secondary)" style={{ margin: '0 auto 4px' }} />
                  <div className="stat-num" style={{ fontSize: '1.4rem' }}>{statistics?.activeComplaints || 3}</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem' }}>{translations[language]?.nav_complaints || 'Complaints'}</div>
                </div>
              </div>
            </div>

            {/* Pateri Today Widget */}
            <div className="glass-card today-widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}>
                <CloudSun size={20} color="var(--secondary)" /> {language === 'hi' ? 'पतेरी आज' : language === 'hn' ? 'Pateri Today' : 'Pateri Today'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span>{language === 'hi' ? 'तापमान' : 'Temperature'}</span>
                  <strong>32°C (Clear)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span>{language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camp'}</span>
                  <strong>22 June 2026</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span>{language === 'hi' ? 'बैठक' : 'Panchayat Meet'}</span>
                  <strong>Every 2nd Tue</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{language === 'hi' ? 'नौकरियाँ' : 'Active Jobs'}</span>
                  <strong>{statistics?.totalJobs || 2} Openings</strong>
                </div>
              </div>
            </div>

            {/* Government Updates Auto-scroll column */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--secondary)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px', color: 'var(--secondary)' }}>
                <Megaphone size={18} /> {language === 'hi' ? 'सरकारी सूचनाएं' : 'Govt Updates'}
              </h3>
              <div ref={updatesRef} style={{ height: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                {[...notices].sort((a, b) => {
                  const w = { 'High': 2, 'Normal': 1, 'Low': 0 };
                  return (w[b.priority] || 0) - (w[a.priority] || 0);
                }).map(notice => (
                  <div key={notice._id} style={{ padding: '8px 10px', background: 'var(--bg-cream)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: notice.priority === 'High' ? '#fee2e2' : '#fef3c7',
                        color: notice.priority === 'High' ? '#b91c1c' : '#d97706'
                      }}>
                        {notice.priority}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <strong style={{ display: 'block', marginBottom: '3px' }}>{notice.title}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.3' }}>
                      {notice.content}
                    </span>
                  </div>
                ))}
                {notices.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                    No announcements posted.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. RESIDENT SERVICES LAYER */}
      <section style={{ padding: 'var(--spacing-lg) 0', background: 'var(--bg-cream)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '25px', fontFamily: 'var(--font-serif)' }}>{language === 'hi' ? 'नागरिक डिजिटल सेवाएँ' : language === 'hn' ? 'Resident Digital Services' : 'Resident Digital Services'}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(4, 120, 87, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                <AlertTriangle size={24} style={{ margin: 'auto' }} />
              </div>
              <h4>{translations[language]?.comp_title || 'Complaint Filing Desk'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
                {language === 'hi' 
                  ? 'पानी की लीकेज, टूटी सोलर लाइट, और नाली की समस्याओं को दर्ज करें। प्राथमिकता बढ़ाने के लिए वोट करें।' 
                  : language === 'hn' 
                  ? 'Paani pipeline leak, solar street light damage aur drainage problems register karein.' 
                  : 'File water pipeline leakages, solar street light damage, and drainage issues.'}
              </p>
              <Link to="/complaints" className="btn-primary" style={{ textAlign: 'center', fontSize: '0.85rem' }}>{translations[language]?.comp_new_btn || 'Open Complaint Desk'}</Link>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(220, 38, 38, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#dc2626' }}>
                <Heart size={24} style={{ margin: 'auto' }} />
              </div>
              <h4>{translations[language]?.blood_title || 'Emergency Blood Bank'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
                {language === 'hi'
                  ? 'रक्त समूह के आधार पर पतेरी में उपलब्ध रक्तदाताओं की खोज करें। आपातकाल में मदद के लिए खुद को पंजीकृत करें।'
                  : language === 'hn'
                  ? 'Blood group ke zariye active blood donors dhoondhein aur emergency me help karein.'
                  : 'Search active available blood donors in Pateri by blood group. Register yourself to help the community.'}
              </p>
              <Link to="/health" className="btn-secondary" style={{ textAlign: 'center', fontSize: '0.85rem' }}>{translations[language]?.btn_search || 'Search Donors'}</Link>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(217, 119, 6, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--secondary)' }}>
                <Briefcase size={24} style={{ margin: 'auto' }} />
              </div>
              <h4>{translations[language]?.jobs_title || 'Village Jobs Center'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
                {language === 'hi'
                  ? 'स्थानीय नौकरियों और रोज़गार के अवसरों (शिक्षण, सोलर इंस्टॉलेशन, कृषि गाइड) की खोज करें।'
                  : language === 'hn'
                  ? 'Gaon me local naukariyon aur employment opportunities ki jankari prapt karein.'
                  : 'Explore local employment and labor work openings published by Panchayat and village shops.'}
              </p>
              <Link to="/jobs" className="btn-outline" style={{ textAlign: 'center', fontSize: '0.85rem' }}>{translations[language]?.nav_jobs || 'View Job Postings'}</Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. COMMUNITY SHOWCASE LAYER */}
      <section style={{ padding: 'var(--spacing-xl) 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
            
            {/* Left: Milestones Timeline */}
            <div className="glass-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <History size={20} color="var(--primary)" /> {language === 'hi' ? 'ग्राम घटनाक्रम' : 'Village Timeline'}
              </h3>
              
              <div className="timeline-list">
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-year">1955</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{language === 'hi' ? 'पतेरी ग्राम की शुरुआती बसावट' : 'Establishment of Pateri'}</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-year">1988</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{language === 'hi' ? 'प्रथम उच्च विद्यालय भवन निर्माण' : 'First High School Building Construction'}</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-year">2002</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{language === 'hi' ? 'पतेरी ग्राम पंचायत का पूर्ण विद्युतीकरण' : 'Electrification of Pateri Panchayat'}</p>
                </div>
                <div className="timeline-item">
                  <div className="timeline-badge" />
                  <div className="timeline-year">2026</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{language === 'hi' ? 'डिजिटल पतेरी स्मार्ट विलेज का शुभारंभ' : 'Digital Pateri Smart Village Launch'}</p>
                </div>
              </div>
            </div>

            {/* Right: MapViewer */}
            <MapViewer />

          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Home;
