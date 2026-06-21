import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, ThumbsUp, Plus, MapPin, CheckCircle, Clock } from 'lucide-react';
import { translations } from '../utils/translations';

function Complaints() {
  const { 
    complaints, fetchComplaints, createComplaint, 
    upvoteComplaint, user, error, villageId, language
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road');
  const [priority, setPriority] = useState('Medium');
  const [mohalla, setMohalla] = useState('Purab Tola');
  const [ward, setWard] = useState('04');
  
  // Coordinates
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    if (villageId) {
      fetchComplaints();
    }
  }, [villageId]);

  const handleDetectLocation = () => {
    // Generate mock coordinates centered around Pateri: 25.0210, 83.5684
    const offsetLat = (Math.random() - 0.5) * 0.005;
    const offsetLng = (Math.random() - 0.5) * 0.005;
    setLat((25.0210 + offsetLat).toFixed(6));
    setLng((83.5684 + offsetLng).toFixed(6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const payload = {
      title,
      description,
      category,
      priority,
      mohalla,
      ward,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      beforeImage: 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?w=300' // Default road/water damage mock
    };

    const success = await createComplaint(payload);
    if (success) {
      setShowForm(false);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={28} color="var(--primary)" />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{translations[language]?.comp_title || 'Complaint Management Portal'}</h1>
        </div>
        
        {user ? (
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> {translations[language]?.comp_new_btn || 'File New Complaint'}
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'hi' ? 'शिकायत दर्ज करने के लिए लॉगिन करें।' : language === 'hn' ? 'Complaints file karne ke liye login karein.' : 'Login to file complaints.'}
          </span>
        )}
      </div>

      {/* Complaint Submission Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="glass-card" style={{ background: 'white', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px' }}>{language === 'hi' ? 'शिकायत टिकट दर्ज करें' : language === 'hn' ? 'Register Complaint Ticket' : 'Register Complaint Ticket'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'शीर्षक' : language === 'hn' ? 'Title' : 'Title'}</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder={language === 'hi' ? 'उदा. चापाकल पाइपलाइन रिसाव' : language === 'hn' ? 'E.g. Handpump pipeline leakage' : 'E.g. Handpump pipeline leakage'} 
                  required 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'विवरण' : language === 'hn' ? 'Description' : 'Description'}</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={translations[language]?.comp_placeholder || 'Explain the issue in detail...'} 
                  required 
                  rows="3" 
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'श्रेणी' : language === 'hn' ? 'Category' : 'Category'}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }}>
                    <option value="Road">{language === 'hi' ? 'सड़क' : 'Road'}</option>
                    <option value="Water">{language === 'hi' ? 'पानी' : 'Water'}</option>
                    <option value="Electricity">{language === 'hi' ? 'बिजली' : 'Electricity'}</option>
                    <option value="Sanitation">{language === 'hi' ? 'स्वच्छता' : 'Sanitation'}</option>
                    <option value="Drainage">{language === 'hi' ? 'निकासी' : 'Drainage'}</option>
                    <option value="Internet">Internet</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'प्राथमिकता' : language === 'hn' ? 'Priority' : 'Priority'}</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }}>
                    <option value="Low">{language === 'hi' ? 'कम' : 'Low'}</option>
                    <option value="Medium">{language === 'hi' ? 'मध्यम' : 'Medium'}</option>
                    <option value="High">{language === 'hi' ? 'उच्च' : 'High'}</option>
                    <option value="Emergency">{language === 'hi' ? 'आपातकालीन' : 'Emergency'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'मोहल्ला' : language === 'hn' ? 'Mohalla' : 'Mohalla'}</label>
                  <select value={mohalla} onChange={(e) => setMohalla(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white' }}>
                    <option value="Purab Tola">Purab Tola</option>
                    <option value="Pipra Tola">Pipra Tola</option>
                    <option value="Dalit Basti">Dalit Basti</option>
                    <option value="Dada Patti">Dada Patti</option>
                    <option value="Market Area">Market Area</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'वार्ड नंबर' : language === 'hn' ? 'Ward No.' : 'Ward No.'}</label>
                  <input type="text" value={ward} onChange={(e) => setWard(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                </div>
              </div>

              {/* Geo Tagging */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'भू-स्थान निर्देशांक' : language === 'hn' ? 'Geo Tag Coordinates' : 'Geo Tag Coordinates'}</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Latitude" value={lat} readOnly style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: '#f5f5f4' }} />
                  <input type="text" placeholder="Longitude" value={lng} readOnly style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: '#f5f5f4' }} />
                </div>
                <button type="button" onClick={handleDetectLocation} className="btn-secondary" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {language === 'hi' ? 'स्थान का पता लगाएं' : language === 'hn' ? 'Detect Location' : 'Detect Location'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{translations[language]?.btn_submit || 'Submit'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ background: '#78716c' }}>{translations[language]?.btn_cancel || 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
            {translations[language]?.comp_no_complaints || 'There are no active complaints in your Panchayat.'}
          </div>
        ) : complaints.map(complaint => (
            <div key={complaint._id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 3.8fr 1fr', gap: '20px', alignItems: 'center' }}>
              
              {/* Before Photo */}
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={complaint.beforeImage || 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?w=300'} 
                  alt="Before Damage"
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <span style={{ fontSize: '0.7rem', display: 'block', marginTop: '4px', color: 'var(--text-muted)' }}>{language === 'hi' ? 'रिपोर्ट से पहले' : language === 'hn' ? 'Before Report' : 'Before Report'}</span>
              </div>

              {/* Body */}
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ 
                    background: complaint.status === 'Resolved' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)', 
                    color: complaint.status === 'Resolved' ? 'var(--success)' : 'var(--secondary)', 
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' 
                  }}>
                    {complaint.status === 'Resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {language === 'hi' && complaint.status === 'Resolved' ? 'हल किया गया' : 
                     language === 'hi' && complaint.status === 'Pending' ? 'लंबित' : 
                     complaint.status}
                  </span>
                  <span style={{ background: 'var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
                    {language === 'hi' && complaint.category === 'Road' ? 'सड़क' :
                     language === 'hi' && complaint.category === 'Water' ? 'पानी' :
                     language === 'hi' && complaint.category === 'Electricity' ? 'बिजली' :
                     language === 'hi' && complaint.category === 'Sanitation' ? 'स्वच्छता' :
                     language === 'hi' && complaint.category === 'Drainage' ? 'निकासी' :
                     complaint.category}
                  </span>
                  <span style={{ color: complaint.priority === 'Emergency' ? '#dc2626' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {language === 'hi' && complaint.priority === 'Low' ? 'कम' :
                     language === 'hi' && complaint.priority === 'Medium' ? 'मध्यम' :
                     language === 'hi' && complaint.priority === 'High' ? 'उच्च' :
                     language === 'hi' && complaint.priority === 'Emergency' ? 'आपातकालीन' :
                     complaint.priority} {language === 'hi' ? 'प्राथमिकता' : 'Priority'}
                  </span>
                </div>
                
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem' }}>{complaint.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', marginBottom: '8px' }}>{complaint.description}</p>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                  <span>{language === 'hi' ? 'मोहल्ला' : 'Mohalla'}: <strong>{complaint.mohalla}</strong> ({translations[language]?.label_ward || 'Ward'} {complaint.ward})</span>
                  {complaint.latitude && (
                    <span>{language === 'hi' ? 'निर्देशांक' : 'Coordinates'}: <strong>{complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}</strong></span>
                  )}
                </div>
              </div>

              {/* Upvotes Column */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                <button 
                  onClick={() => upvoteComplaint(complaint._id)}
                  disabled={!user}
                  style={{ 
                    background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed', 
                    color: user && complaint.upvotes?.includes(user.id) ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <ThumbsUp size={24} style={{ transform: user && complaint.upvotes?.includes(user.id) ? 'scale(1.15)' : 'none', transition: 'all 0.2s' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {complaint.upvotes?.length || 0} {language === 'hi' ? 'वोट' : language === 'hn' ? 'Upvotes' : 'Upvotes'}
                  </span>
                </button>
              </div>

            </div>
          ))}
      </div>

    </div>
  );
}

export default Complaints;
