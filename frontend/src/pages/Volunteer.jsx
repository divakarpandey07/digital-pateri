import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { 
  Users, UserCheck, Heart, ShieldAlert, Clock, 
  Check, Plus, Search, Award, Phone, Calendar, 
  AlertTriangle, MessageSquare, Briefcase, HelpCircle
} from 'lucide-react';
import { translations } from '../utils/translations';

const API_BASE = '/api/v1';

// Category color mappings
const getCategoryColor = (cat) => {
  switch (cat) {
    case 'Education': return '#3b82f6'; // Blue
    case 'Health': return '#ec4899'; // Pink
    case 'Disaster Relief': return '#ef4444'; // Red
    case 'Blood Donation': return '#dc2626'; // Dark Red
    case 'Social Service': return '#10b981'; // Green
    default: return 'var(--text-muted)';
  }
};

function Volunteer() {
  const { user, villageId, language } = useStore();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'tickets'
  
  // Data lists
  const [volunteers, setVolunteers] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Filtering & Search
  const [skillSearch, setSkillSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  // Modals & Forms UI
  const [showRegModal, setShowRegModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);

  // Volunteer Registration Form
  const [regForm, setRegForm] = useState({
    skills: '',
    availability: 'On Call',
    category: 'Social Service',
    phoneVisible: true
  });

  // Ticket Request Form
  const [reqForm, setReqForm] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get auth headers helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('pateri_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (villageId) {
      if (activeTab === 'directory') {
        fetchVolunteers();
      } else {
        fetchRequests();
      }
    }
  }, [villageId, activeTab, skillSearch, categoryFilter, availabilityFilter]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/volunteers`, {
        params: {
          villageId,
          category: categoryFilter || undefined,
          availability: availabilityFilter || undefined,
          skill: skillSearch || undefined
        }
      });
      setVolunteers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/volunteers/requests`, {
        params: { villageId }
      });
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!user.residentProfile) {
      setMessage({
        type: 'danger',
        text: language === 'hi' 
          ? 'स्वयंसेवक के रूप में पंजीकरण करने से पहले आपको प्रोफाइल लॉगिन सेटिंग्स में एक वैध नागरिक आईडी लिंक करनी होगी।' 
          : language === 'hn'
          ? 'Volunteer register karne se pehle aapko profile login settings me valid Resident ID link karni hogi.'
          : 'You must link a valid Resident ID in the profile login settings before registering as a volunteer.'
      });
      return;
    }

    try {
      const formattedSkills = regForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post(`${API_BASE}/volunteers`, {
        ...regForm,
        skills: formattedSkills
      }, {
        headers: getAuthHeaders()
      });

      setMessage({
        type: 'success',
        text: language === 'hi'
          ? 'पतेरी नेटवर्क में स्वयंसेवक सफलतापूर्वक पंजीकृत/अपडेट किया गया!'
          : language === 'hn'
          ? 'Volunteer successfully register/update ho gaya Pateri Network me!'
          : 'Volunteer registered/updated successfully in the Pateri Network!'
      });
      setTimeout(() => {
        setShowRegModal(false);
        setMessage({ type: '', text: '' });
        fetchVolunteers();
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Registration failed.'
      });
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!reqForm.title || !reqForm.description) {
      setMessage({
        type: 'danger',
        text: language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : language === 'hn' ? 'Please saare required fields bharein.' : 'Please fill all required fields.'
      });
      return;
    }

    try {
      await axios.post(`${API_BASE}/volunteers/requests`, {
        ...reqForm,
        villageId
      }, {
        headers: getAuthHeaders()
      });

      setMessage({
        type: 'success',
        text: language === 'hi'
          ? 'स्वयंसेवक सहायता टिकट सफलतापूर्वक बनाया गया! श्रेणी के स्वयंसेवकों को अलर्ट भेजा गया।'
          : language === 'hn'
          ? 'Volunteer assistance ticket successfully ban gaya! Category volunteers ko alert bhej diya gaya hai.'
          : 'Volunteer assistance ticket created successfully! Alerts sent to category volunteers.'
      });
      setReqForm({ title: '', description: '', priority: 'Medium' });
      setTimeout(() => {
        setShowReqModal(false);
        setMessage({ type: '', text: '' });
        fetchRequests();
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Request failed.'
      });
    }
  };

  const handleClaimRequest = async (requestId) => {
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(`${API_BASE}/volunteers/requests/${requestId}`, {
        status: 'Assigned',
        assignedVolunteer: user.id
      }, {
        headers: getAuthHeaders()
      });
      setMessage({
        type: 'success',
        text: language === 'hi'
          ? 'टिकट का आपने सफलतापूर्वक दावा किया है! कृपया नागरिक से संपर्क करें।'
          : language === 'hn'
          ? 'Ticket aapne successfully claim kar liya hai! Kripya resident se contact karein.'
          : 'Ticket successfully claimed by you! Please contact resident.'
      });
      fetchRequests();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to claim request.'
      });
    }
  };

  const handleCompleteRequest = async (requestId) => {
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(`${API_BASE}/volunteers/requests/${requestId}`, {
        status: 'Completed'
      }, {
        headers: getAuthHeaders()
      });
      setMessage({
        type: 'success',
        text: language === 'hi' ? 'टिकट को पूर्ण के रूप में चिह्नित किया गया। बहुत बढ़िया!' : language === 'hn' ? 'Ticket Completed mark ho gaya. Bahut badhiya!' : 'Ticket marked as Completed. Good job!'
      });
      fetchRequests();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to complete request.'
      });
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0' }}>
      
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 className="section-title">{translations[language]?.vol_title || 'Pateri Volunteer Network'}</h1>
          <p className="section-subtitle">{translations[language]?.vol_subtitle || 'Local community solidarity hub for mutual aid and emergency help coordination'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {user && (
            <button onClick={() => setShowRegModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} /> {translations[language]?.vol_register_btn || 'Join as Volunteer'}
            </button>
          )}
          {user && (
            <button onClick={() => setShowReqModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> {language === 'hi' ? 'सहायता का अनुरोध' : language === 'hn' ? 'Help Request' : 'Request Help'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-container" style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 'var(--spacing-lg)' }}>
        <button 
          onClick={() => setActiveTab('directory')}
          className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
          style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'directory' ? '3px solid var(--primary)' : 'none', fontWeight: 'bold' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> {language === 'hi' ? 'स्वयंसेवक निर्देशिका' : language === 'hn' ? 'Volunteers Directory' : 'Volunteers Directory'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'tickets' ? '3px solid var(--primary)' : 'none', fontWeight: 'bold' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> {language === 'hi' ? 'सहायता अनुरोध टिकट' : language === 'hn' ? 'Help Request Tickets' : 'Help Request Tickets'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--spacing-md)' }}>
          {message.text}
        </div>
      )}

      {/* Directory Tab Content */}
      {activeTab === 'directory' && (
        <>
          {/* Filters Bar */}
          <div className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder={language === 'hi' ? 'कौशल खोजें (जैसे शिक्षण, वायरिंग, जैविक खेती...)' : language === 'hn' ? 'Skills search (e.g. teaching, wiring, organic farming...)' : 'Search skills (e.g. teaching, wiring, organic farming...)'}
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>
            <div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '8px', width: '100%' }}>
                <option value="">{language === 'hi' ? 'सभी सेवा क्षेत्र' : language === 'hn' ? 'Saare Service Areas' : 'All Service Areas'}</option>
                <option value="Education">{language === 'hi' ? 'शिक्षा' : 'Education'}</option>
                <option value="Health">{language === 'hi' ? 'स्वास्थ्य' : 'Health'}</option>
                <option value="Disaster Relief">{language === 'hi' ? 'आपदा राहत' : 'Disaster Relief'}</option>
                <option value="Blood Donation">{language === 'hi' ? 'रक्तदान' : 'Blood Donation'}</option>
                <option value="Social Service">{language === 'hi' ? 'समाज सेवा' : 'Social Service'}</option>
              </select>
            </div>
            <div>
              <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} style={{ padding: '8px', width: '100%' }}>
                <option value="">{language === 'hi' ? 'सभी उपलब्धता प्रकार' : language === 'hn' ? 'Saare Availability Types' : 'All Availability Types'}</option>
                <option value="Daily">{language === 'hi' ? 'दैनिक' : language === 'hn' ? 'Daily' : 'Daily'}</option>
                <option value="Weekends Only">{language === 'hi' ? 'केवल वीकेंड' : language === 'hn' ? 'Weekends Only' : 'Weekends Only'}</option>
                <option value="On Call">{language === 'hi' ? 'ऑन कॉल' : language === 'hn' ? 'On Call' : 'On Call'}</option>
              </select>
            </div>
          </div>

          {/* Volunteers Cards List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{language === 'hi' ? 'स्वयंसेवक निर्देशिका लोड हो रही है...' : language === 'hn' ? 'Volunteer directory load ho rahi hai...' : 'Loading volunteer directory...'}</div>
          ) : volunteers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{translations[language]?.vol_no_volunteers || 'No active volunteers listed yet.'}</div>
          ) : (
            <div className="grid-3" style={{ gap: 'var(--spacing-lg)' }}>
              {volunteers.map((vol) => (
                <div key={vol._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                  
                  {/* Bio details header */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                    {vol.residentId?.gender === 'Male' ? (
                      <div 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '24px', 
                          backgroundColor: '#eff6ff', 
                          color: '#2563eb',
                          border: '2px solid #bfdbfe',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        ♂
                      </div>
                    ) : (
                      <div 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '24px', 
                          backgroundColor: '#fdf2f8', 
                          color: '#db2777',
                          border: '2px solid #fbcfe8',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        ♀
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{vol.residentId?.name}</h3>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span className="badge" style={{ background: getCategoryColor(vol.category), color: 'white', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>
                          {language === 'hi' && vol.category === 'Education' ? 'शिक्षा'
                           : language === 'hi' && vol.category === 'Health' ? 'स्वास्थ्य'
                           : language === 'hi' && vol.category === 'Disaster Relief' ? 'आपदा राहत'
                           : language === 'hi' && vol.category === 'Blood Donation' ? 'रक्तदान'
                           : language === 'hi' && vol.category === 'Social Service' ? 'समाज सेवा'
                           : vol.category}
                        </span>
                        <span className="badge" style={{ background: 'var(--bg-cream)', border: '1px solid var(--border)', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {language === 'hi' && vol.availability === 'Daily' ? 'दैनिक'
                           : language === 'hi' && vol.availability === 'Weekends Only' ? 'केवल वीकेंड'
                           : language === 'hi' && vol.availability === 'On Call' ? 'ऑन कॉल'
                           : vol.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills list */}
                  <div style={{ flex: 1, marginBottom: 'var(--spacing-md)' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{language === 'hi' ? 'कौशल और सेवा क्षेत्र:' : language === 'hn' ? 'Skills aur Service Areas:' : 'Skills & Service Areas:'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {vol.skills.map((skill, index) => (
                        <span key={index} style={{ background: '#f3f4f6', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '12px' }}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <hr style={{ margin: '0 0 var(--spacing-sm) 0' }} />

                  {/* Mobile contact info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <Phone size={14} className="text-muted" />
                    {vol.residentId?.mobile === 'Hidden' ? (
                      <span className="text-muted" style={{ fontStyle: 'italic' }}>Contact details hidden</span>
                    ) : (
                      <a href={`tel:${vol.residentId?.mobile}`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>+91 {vol.residentId?.mobile}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tickets Tab Content */}
      {activeTab === 'tickets' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{language === 'hi' ? 'स्वयंसेवक टिकट लोड हो रहे हैं...' : language === 'hn' ? 'Volunteer tickets load ho rahe hain...' : 'Loading volunteer tickets...'}</div>
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{language === 'hi' ? 'कोई सक्रिय अनुरोध नहीं मिला।' : language === 'hn' ? 'Koi active requests nahi mile.' : 'No active requests found.'}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {requests.map((req) => {
                const isAssignedToMe = user && req.assignedVolunteer?._id === user.id;
                const canComplete = isAssignedToMe || (user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r)));
                const isVolunteer = user && user.roles.includes('Volunteer');
                
                return (
                  <div key={req._id} className="card" style={{ borderLeft: req.priority === 'Emergency' ? '6px solid var(--danger)' : (req.priority === 'High' ? '6px solid var(--warning)' : '6px solid var(--border)') }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h3 style={{ margin: 0 }}>{req.title}</h3>
                          <span className={`badge-priority ${req.priority}`} style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            color: 'white',
                            background: req.priority === 'Emergency' ? 'var(--danger)' : (req.priority === 'High' ? 'var(--warning)' : (req.priority === 'Medium' ? 'var(--secondary)' : 'var(--text-muted)'))
                          }}>
                            {language === 'hi' && req.priority === 'Emergency' ? 'आपातकालीन'
                             : language === 'hi' && req.priority === 'High' ? 'उच्च'
                             : language === 'hi' && req.priority === 'Medium' ? 'मध्यम'
                             : language === 'hi' && req.priority === 'Low' ? 'कम'
                             : req.priority} {language === 'hi' ? 'प्राथमिकता' : 'Priority'}
                          </span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            color: req.status === 'Completed' ? 'white' : 'var(--text-dark)',
                            background: req.status === 'Completed' ? 'var(--success)' : (req.status === 'Assigned' ? '#dbeafe' : '#f3f4f6')
                          }}>
                            {language === 'hi' && req.status === 'Pending' ? 'लंबित'
                             : language === 'hi' && req.status === 'Assigned' ? 'सौंपी गई'
                             : language === 'hi' && req.status === 'Completed' ? 'पूर्ण'
                             : req.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{req.description}</p>
                        
                        {/* Time intervals milestones */}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>{language === 'hi' ? 'खोला गया:' : language === 'hn' ? 'Opened:' : 'Opened:'} {new Date(req.createdAt).toLocaleString()}</span>
                          {req.completedAt && (
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{language === 'hi' ? 'समाधान:' : language === 'hn' ? 'Resolved:' : 'Resolved:'} {new Date(req.completedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                          <span className="text-muted">{language === 'hi' ? 'अनुरोधकर्ता:' : language === 'hn' ? 'Requested by:' : 'Requested by:'}</span> <span style={{ fontWeight: '600' }}>{req.requestedBy?.residentProfile?.name || req.requestedBy?.email}</span>
                        </div>
                        {req.status === 'Assigned' && req.assignedVolunteer && (
                          <div style={{ fontSize: '0.85rem', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="text-muted">{language === 'hi' ? 'स्वयंसेवक:' : language === 'hn' ? 'Assigned to:' : 'Assigned to:'}</span> <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{req.assignedVolunteer?.residentProfile?.name || req.assignedVolunteer?.email}</span>
                          </div>
                        )}

                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          {req.status === 'Pending' && isVolunteer && (
                            <button onClick={() => handleClaimRequest(req._id)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                              {language === 'hi' ? 'अनुरोध स्वीकार करें' : language === 'hn' ? 'Accept Request' : 'Accept Request'}
                            </button>
                          )}
                          {req.status === 'Assigned' && canComplete && (
                            <button onClick={() => handleCompleteRequest(req._id)} className="btn-success" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                              <Check size={14} /> {language === 'hi' ? 'समाधान चिह्नित करें' : language === 'hn' ? 'Mark Resolved' : 'Mark Resolved'}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Volunteer Registration Modal */}
      {showRegModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card modal-content" style={{ width: '450px', position: 'relative', padding: 'var(--spacing-lg)' }}>
            <button 
              onClick={() => setShowRegModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
              {language === 'hi' ? 'स्वयंसेवक बनें' : language === 'hn' ? 'Volunteer Banein' : 'Become a Volunteer'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
              {language === 'hi' ? 'पतेरी के अन्य ग्रामीणों की मदद के लिए अपने कौशल साझा करें' : language === 'hn' ? 'Apne skills share karein Pateri ke baaki logo ki help ke liye' : 'Share your skills to help other villagers in Pateri'}
            </p>
            
            <form onSubmit={handleRegisterVolunteer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'सेवा क्षेत्र *' : language === 'hn' ? 'Service Area *' : 'Service Area *'}
                </label>
                <select 
                  required
                  value={regForm.category}
                  onChange={(e) => setRegForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Education">{language === 'hi' ? 'शिक्षा (शिक्षण/ट्यूशन)' : 'Education (Teaching/Tutoring)'}</option>
                  <option value="Health">{language === 'hi' ? 'स्वास्थ्य (प्राथमिक चिकित्सा/क्लिनिक)' : 'Health (First aid/Clinics)'}</option>
                  <option value="Disaster Relief">{language === 'hi' ? 'आपदा राहत (आग/बाढ़)' : 'Disaster Relief (Fires/Floods)'}</option>
                  <option value="Blood Donation">{language === 'hi' ? 'रक्तदान' : 'Blood Donation'}</option>
                  <option value="Social Service">{language === 'hi' ? 'समाज सेवा (सामुदायिक कार्य)' : 'Social Service (Community works)'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'कौशल * (अल्पविराम से अलग)' : language === 'hn' ? 'Skills * (comma separated)' : 'Skills * (comma separated)'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Maths doubt solving, Wiring, Plumbing, driving"
                  value={regForm.skills}
                  onChange={(e) => setRegForm(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'उपलब्धता *' : language === 'hn' ? 'Availability *' : 'Availability *'}
                </label>
                <select 
                  required
                  value={regForm.availability}
                  onChange={(e) => setRegForm(prev => ({ ...prev, availability: e.target.value }))}
                >
                  <option value="Daily">{language === 'hi' ? 'दैनिक' : language === 'hn' ? 'Daily' : 'Daily'}</option>
                  <option value="Weekends Only">{language === 'hi' ? 'केवल वीकेंड' : language === 'hn' ? 'Weekends Only' : 'Weekends Only'}</option>
                  <option value="On Call">{language === 'hi' ? 'ऑन कॉल (आपातकालीन संपर्क)' : language === 'hn' ? 'On Call (Emergency contact)' : 'On Call (Emergency contact)'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="phoneVisible"
                  checked={regForm.phoneVisible}
                  onChange={(e) => setRegForm(prev => ({ ...prev, phoneVisible: e.target.checked }))}
                />
                <label htmlFor="phoneVisible" style={{ fontSize: '0.85rem' }}>
                  {language === 'hi' ? 'मेरा संपर्क नंबर ग्रामीणों को दिखाई दे' : language === 'hn' ? 'Mera contact number residents ko dikhe' : 'Make my contact number visible to residents'}
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {language === 'hi' ? 'पंजीकरण / अपडेट' : language === 'hn' ? 'Register/Update' : 'Register/Update'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Creation Modal */}
      {showReqModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card modal-content" style={{ width: '450px', position: 'relative', padding: 'var(--spacing-lg)' }}>
            <button 
              onClick={() => setShowReqModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
              {language === 'hi' ? 'सहायता का अनुरोध करें' : language === 'hn' ? 'Request Assistance' : 'Request Assistance'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
              {language === 'hi' ? 'मदद के लिए अनुरोध भेजें। पतेरी स्वयंसेवकों को सतर्क किया जाएगा।' : language === 'hn' ? 'Help request submit karein. Pateri volunteers ko alert kiya jayega.' : 'Submit help request. Pateri volunteers will be alerted.'}
            </p>
            
            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'मदद का शीर्षक *' : language === 'hn' ? 'Help Title *' : 'Help Title *'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. High School Math Doubts Support"
                  value={reqForm.title}
                  onChange={(e) => setReqForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'आवश्यकता का विवरण *' : language === 'hn' ? 'Describe what you need *' : 'Describe what you need *'}
                </label>
                <textarea 
                  required
                  rows="4"
                  placeholder={language === 'hi' ? 'मदद का विवरण, स्थान और समय बताएं...' : language === 'hn' ? 'Help details, location aur timing likhein...' : 'Provide details of help required, location and timing...'}
                  value={reqForm.description}
                  onChange={(e) => setReqForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'प्राथमिकता स्तर' : language === 'hn' ? 'Priority Level' : 'Priority Level'}
                </label>
                <select 
                  value={reqForm.priority}
                  onChange={(e) => setReqForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Low">{language === 'hi' ? 'कम (सामान्य शिक्षण/मदद)' : 'Low (General coaching/help)'}</option>
                  <option value="Medium">{language === 'hi' ? 'मध्यम (घरेलू सहायता)' : 'Medium (Household aids)'}</option>
                  <option value="High">{language === 'hi' ? 'उच्च (त्वरित कार्य)' : 'High (Urgent tasks)'}</option>
                  <option value="Emergency">{language === 'hi' ? 'आपातकाल (तत्काल ध्यान)' : 'Emergency (Immediate attention)'}</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {language === 'hi' ? 'अनुरोध पोस्ट करें' : language === 'hn' ? 'Post Request' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Volunteer;
