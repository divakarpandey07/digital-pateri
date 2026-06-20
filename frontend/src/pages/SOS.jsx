import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { ShieldAlert, AlertTriangle, Shield, Phone, Flame, HeartPulse, UserCheck, Droplet, Zap } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { role: 'Mukhiya (Reshad Khan)', phone: '+91 7903752442', icon: '👤' },
  { role: 'Sarpanch (Gyashuddin)', phone: '+91 9473385742', icon: '⚖️' },
  { role: 'Police Helpline (Chand)', phone: '112', icon: '🚓' },
  { role: 'Ambulance Service', phone: '102', icon: '🚑' },
  { role: 'Sub-divisional Hospital (Bhabua)', phone: '+91 6189 224488', icon: '🏥' }
];

const CATEGORIES = [
  { id: 'Medical', label: 'Medical Emergency', icon: HeartPulse, color: '#ef4444' },
  { id: 'Fire', label: 'Fire Outbreak', icon: Flame, color: '#f97316' },
  { id: 'Accident', label: 'Road Accident', icon: AlertTriangle, color: '#eab308' },
  { id: 'Women Safety', label: 'Women Safety', icon: Shield, color: '#ec4899' },
  { id: 'Electricity', label: 'Power Hazard', icon: Zap, color: '#3b82f6' },
  { id: 'Water Crisis', label: 'Water Contamination', icon: Droplet, color: '#06b6d4' }
];

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function SOS() {
  const { language } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('Medical');
  const [isTriggered, setIsTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [coordinates, setCoordinates] = useState(null);

  const triggerSOS = () => {
    setLoading(true);
    setStatusMsg('Acquiring high-accuracy GPS coordinates...');
    
    const fallbackLocation = { latitude: 25.0202, longitude: 83.5674 }; // Pateri Centroid
 
    const sendSosRequest = async (lat, lng) => {
      try {
        const res = await axios.post(`${API_BASE}/sos/trigger`, {
          category: selectedCategory,
          latitude: lat,
          longitude: lng
        });
        setIsTriggered(true);
        setCoordinates({ latitude: lat, longitude: lng });
        setStatusMsg(res.data.message);
      } catch (err) {
        console.error(err);
        setStatusMsg('Failed to broadcast SOS. Please call emergency services directly.');
      } finally {
        setLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendSosRequest(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation failed, using village fallback coordinates', error);
          sendSosRequest(fallbackLocation.latitude, fallbackLocation.longitude);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendSosRequest(fallbackLocation.latitude, fallbackLocation.longitude);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#e11d48', fontSize: '2.5rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <ShieldAlert size={36} className="pulse" />
          {language === 'hi' ? 'आपातकालीन एसओएस' : language === 'hn' ? 'Emergency SOS' : 'Emergency SOS Dispatch'}
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Triggering SOS instantly alerts village ward members, Mukhiya Reshad Khan, and local volunteers with your GPS coordinates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: SOS Trigger */}
        <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', borderTop: '6px solid #e11d48' }}>
          
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px', alignSelf: 'flex-start' }}>
            Select Emergency Category
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', marginBottom: '30px' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: isSelected ? `2.5px solid ${cat.color}` : '1.5px solid var(--border)',
                    background: isSelected ? `${cat.color}15` : 'white',
                    color: isSelected ? cat.color : 'var(--text-dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <Icon size={20} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Trigger Button */}
          {!isTriggered ? (
            <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer pulsing ring */}
              <div 
                className="pulse" 
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  background: 'rgba(225, 29, 72, 0.12)' 
                }}
              ></div>
              <button
                onClick={triggerSOS}
                disabled={loading}
                style={{
                  width: '170px',
                  height: '170px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  boxShadow: '0 10px 25px rgba(225, 29, 72, 0.4)',
                  cursor: 'pointer',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.02)'}
              >
                <span>{loading ? 'ACQUIRING...' : 'TRIGGER'}</span>
                <span style={{ fontSize: '1.8rem' }}>SOS</span>
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'scaleIn 0.3s ease' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', border: '3px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                <Shield size={40} />
              </div>
              <h3 style={{ color: '#22c55e', margin: '0 0 5px 0' }}>SOS Broadcast Active</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 15px 0' }}>
                Your GPS coordinates ({coordinates?.latitude?.toFixed(4)}, {coordinates?.longitude?.toFixed(4)}) have been dispatched.
              </p>
              <button 
                onClick={() => setIsTriggered(false)}
                className="btn btn-secondary"
                style={{ padding: '6px 15px', fontSize: '0.8rem' }}
              >
                Reset alarm
              </button>
            </div>
          )}

          {statusMsg && (
            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 15px', borderRadius: '8px', textAlign: 'center', width: '100%' }}>
              {statusMsg}
            </div>
          )}
        </div>

        {/* Right Side: Quick Dial Contacts */}
        <div className="glass-card" style={{ padding: '25px', borderTop: '6px solid var(--primary)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px' }}>
            Emergency Contact Directory
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {EMERGENCY_CONTACTS.map(contact => (
              <div 
                key={contact.role}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 15px', 
                  background: 'var(--bg-cream)', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{contact.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{contact.role}</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{contact.phone}</span>
                  </div>
                </div>
                <a 
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Phone size={12} /> Call
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default SOS;
