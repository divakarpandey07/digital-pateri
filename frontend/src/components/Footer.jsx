import React from 'react';
import { Phone, Heart, Shield, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';

function Footer() {
  const { language } = useStore();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* About Column */}
          <div>
            <h3>Digital Pateri Smart Portal</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Gram Panchayat Pateri (Thana Chand, Jila Kaimur, Bihar, PIN: 821106). Empowers residents with direct complaint ticketing, emergency blood registries, and local jobs information.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3>{language === 'hi' ? 'पंचायत संसाधन' : 'Panchayat Resources'}</h3>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a href="https://epds.bihar.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {language === 'hi' ? 'सरकारी सेवाएँ लिंक (आधार, वोटर आईडी, राशन कार्ड)' : 'Government Services Link (Aadhaar, Voter ID, Ration Card)'}
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {language === 'hi' ? 'पीएम किसान पोर्टल गाइड' : 'PM Kisan Portal Guide'}
                </a>
              </li>
              <li>
                <a href="https://www.7nishchay-yuvaupopeshan.bihar.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {language === 'hi' ? 'बिहार स्टूडेंट क्रेडिट कार्ड' : 'Bihar Student Credit Card'}
                </a>
              </li>
              <li>
                <a href="https://serviceonline.bihar.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--secondary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                  {language === 'hi' ? 'आरटीपीएस बिहार ऑनलाइन पोर्टल' : 'RTPS Bihar Online Portal'}
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Helpline Column */}
          <div className="footer-emergency-box">
            <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={18} /> Emergency Help
            </h3>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#ef4444" /> Mukhiya: <strong>+91 7903752442</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#ef4444" /> Police Thana Chand: <strong>112</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#ef4444" /> Ambulance Service: <strong>102</strong>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #2e2a28', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>© 2026 Digital Pateri. All rights reserved. Designed for Pateri Gram Panchayat.</span>
          <span>Connecting People, Preserving Heritage, Empowering Future.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
