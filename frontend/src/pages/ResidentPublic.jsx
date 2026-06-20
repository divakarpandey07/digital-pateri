import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShieldCheck, ShieldAlert, Award, Heart, CheckCircle2, UserCheck, Calendar } from 'lucide-react';

function ResidentPublic() {
  const { residentId } = useParams();
  const { fetchPublicResidentProfile, isLoading } = useStore();

  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setErrorMsg('');
      const res = await fetchPublicResidentProfile(residentId);
      if (res) {
        setData(res);
      } else {
        setErrorMsg('Resident record not found or profile has been set to private.');
      }
    };
    loadProfile();
  }, [residentId]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) 0', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Resolving digital identity records...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) 0', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '450px', margin: '0 auto', borderTop: '4px solid var(--danger)' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 15px' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>Verification Alert</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, badges } = data;

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        
        {/* Verification Status Header Card */}
        <div className="glass-card" style={{ 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', 
          color: 'white', 
          padding: '30px 20px', 
          border: '1px solid #059669',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 15px', 
            border: '2px solid #34d399'
          }}>
            <UserCheck size={36} color="#34d399" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 5px 0' }}>Identity Verified</h2>
          <div style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Official Pateri Resident Registry
          </div>
        </div>

        {/* Public Profile Details Panel */}
        <div className="glass-card" style={{ 
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Identity details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
              <strong>{profile.name}</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Resident ID:</span>
              <strong style={{ letterSpacing: '0.5px' }}>{profile.residentId}</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Age / Gender:</span>
              <strong>{profile.age || 'N/A'} Yrs / {profile.gender}</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Address / House:</span>
              <strong>H-{profile.houseNo || 'N/A'}, Ward {profile.ward}</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Village / District:</span>
              <strong>Pateri, Kaimur (Bihar)</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Occupation:</span>
              <strong>{profile.occupation || 'Resident'}</strong>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Education:</span>
              <strong>{profile.education || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={15} /> Registered Since:
              </span>
              <strong>{new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</strong>
            </div>
          </div>

          {/* Dynamic Badges Showcase Panel (Phase 6) */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verification Badges
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Green Badge: Verified Resident */}
              {badges.isVerifiedResident && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#065f46', fontWeight: '500' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Verified Resident Badge</span>
                </div>
              )}

              {/* Blue Badge: Verified Volunteer */}
              {badges.isVolunteer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af', fontWeight: '500' }}>
                  <Award size={16} color="#3b82f6" />
                  <span>Verified Volunteer Badge</span>
                </div>
              )}

              {/* Red Badge: Emergency Blood Donor */}
              {badges.isBloodDonor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b', fontWeight: '500' }}>
                  <Heart size={16} color="#ef4444" />
                  <span>Active Emergency Blood Donor</span>
                </div>
              )}

              {/* Gold Badge: Panchayat Official */}
              {badges.isOfficial && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e', fontWeight: '500' }}>
                  <ShieldCheck size={16} color="#d97706" />
                  <span>Gold Badge: Panchayat Official</span>
                </div>
              )}
            </div>
          </div>

          {/* Secure System Warning footer */}
          <div style={{ background: 'var(--bg-cream)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Private fields (Aadhaar, Voter ID, Ration, Contacts) are encrypted and hidden. Verified by Pateri Gram Panchayat.
          </div>

        </div>

      </div>
    </div>
  );
}

export default ResidentPublic;
