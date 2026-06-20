import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Heart, Search, Phone, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { translations } from '../utils/translations';

function Health() {
  const { donors, fetchDonors, isLoading, villageId, language } = useStore();
  const [bloodGroup, setBloodGroup] = useState('');

  useEffect(() => {
    if (villageId) {
      fetchDonors(bloodGroup);
    }
  }, [villageId, bloodGroup]);

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
        <Heart size={28} color="#dc2626" />
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{translations[language]?.blood_title || 'Pateri Emergency Blood Donor Directory'}</h1>
      </div>

      {/* Emergency Warning */}
      <div className="glass-card" style={{ background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.2)', marginBottom: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <ShieldAlert size={36} color="#dc2626" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ color: '#dc2626', margin: '0 0 4px 0' }}>{language === 'hi' ? 'महत्वपूर्ण आपातकालीन सूचना' : language === 'hn' ? 'Urgent Emergency Note' : 'Urgent Emergency Note'}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
            {language === 'hi' ? 'कृपया इन नंबरों पर तभी कॉल करें जब किसी को वास्तव में रक्त की आवश्यकता हो। निवासी संपर्क विवरण का दुरुपयोग न करें। गोपनीयता की निगरानी की जाती है।' : 
             language === 'hn' ? 'Kripya in numbers par tabhi call karein jab kisi ko sach mein khoon (blood) ki avashyakta ho. Do not spam or misuse resident contact details. Privacy is monitored.' : 
             'Please only call these numbers in case of real medical emergencies. Do not spam or misuse resident contact details. Privacy is strictly monitored.'}
          </p>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="glass-card" style={{ marginBottom: '25px', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Search size={14} /> {language === 'hi' ? 'रक्त समूह से फ़िल्टर करें:' : language === 'hn' ? 'Filter by Blood Group:' : 'Filter by Blood Group:'}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['', 'A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
              <button 
                key={bg} 
                onClick={() => setBloodGroup(bg)} 
                className="btn-secondary"
                style={{ 
                  background: bloodGroup === bg ? 'var(--primary)' : 'var(--border)', 
                  color: bloodGroup === bg ? 'white' : 'var(--text-dark)', 
                  padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' 
                }}
              >
                {bg || (language === 'hi' ? 'सभी' : language === 'hn' ? 'All' : 'All')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Donors Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>{language === 'hi' ? 'सक्रिय रक्तदाताओं की खोज की जा रही है...' : language === 'hn' ? 'Active donors search ho rahe hain...' : 'Searching active donors database...'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {donors.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <Info size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>{translations[language]?.blood_no_donors || 'Gram Panchayat me is category ke koi active blood donors nahi mile.'}</p>
            </div>
          ) : (
            donors.map(donor => (
              <div key={donor._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #dc2626' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, color: 'var(--primary)' }}>{donor.residentId?.name}</h4>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {donor.bloodGroup}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: '6px 0' }}>
                  <div>{translations[language]?.label_address || 'Location'}: <strong>{donor.residentId?.mohalla || 'Pateri'}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: '500' }}>
                    <CheckCircle size={12} /> {language === 'hi' ? 'उपलब्धता स्थिति: सक्रिय' : language === 'hn' ? 'Available Status: Active' : 'Available Status: Active'}
                  </div>
                </div>

                {donor.residentId?.mobile && (
                  <a href={`tel:${donor.residentId.mobile}`} className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#dc2626' }}>
                    <Phone size={14} /> {language === 'hi' ? 'रक्तदाता को कॉल करें' : language === 'hn' ? 'Call Donor' : 'Call Donor'} (+91 {donor.residentId.mobile})
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default Health;
