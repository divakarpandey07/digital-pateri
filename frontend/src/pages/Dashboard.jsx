import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  User, Users, Shield, ShieldAlert, Award, 
  MapPin, Heart, Briefcase, FileText, Send, 
  Plus, CheckCircle, Clock, AlertTriangle, ChevronRight, X, Sprout
} from 'lucide-react';
import { translations } from '../utils/translations';

function Dashboard() {
  const { 
    user, error, isLoading, residentProfile, 
    requestOtp, verifyClaim, fetchMyResidentProfile, 
    requestCertificate, language 
  } = useStore();

  const navigate = useNavigate();

  // Claim Profile Steps state: 'init' | 'mobile' | 'otp' | 'aadhaar' | 'found'
  const [claimStep, setClaimStep] = useState('init');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [claimError, setClaimError] = useState('');
  const [foundProfile, setFoundProfile] = useState(null);

  // Certificate Form state
  const [certType, setCertType] = useState('Residence');
  const [certReason, setCertReason] = useState('');
  const [incomeValue, setIncomeValue] = useState('');
  const [certSuccess, setCertSuccess] = useState('');

  // Active Card Language (Internal switcher for Card, defaults to active store language)
  const [cardLang, setCardLang] = useState(language);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.residentProfile) {
      fetchMyResidentProfile();
    }
  }, [user]);

  // Sync card language with store language on mount or store lang change
  useEffect(() => {
    setCardLang(language);
  }, [language]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setClaimError('');
    if (!mobile) return;

    const res = await requestOtp(mobile);
    if (res && res.success) {
      setClaimStep('otp');
    } else {
      setClaimError(error || 'Failed to send OTP. Please verify your mobile is registered.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setClaimError('');
    if (!otp) return;

    const res = await verifyClaim(mobile, otp, '');
    if (res && res.success) {
      if (res.needsAadhaar) {
        setClaimStep('aadhaar');
      } else {
        // Logged in directly!
        await fetchMyResidentProfile();
        setClaimStep('init');
        window.location.reload();
      }
    } else {
      setClaimError(res.error || 'Invalid verification code. Please enter 123456 for testing.');
    }
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setClaimError('');
    if (!aadhaarLast4) return;

    const res = await verifyClaim(mobile, otp, aadhaarLast4);
    if (res && res.success) {
      await fetchMyResidentProfile();
      setClaimStep('init');
      window.location.reload();
    } else {
      setClaimError(res.error || 'Identity matching failed. Ensure Aadhaar Last 4 digits match.');
    }
  };

  const handleCertificateSubmit = async (e) => {
    e.preventDefault();
    setCertSuccess('');
    if (!certReason) return;

    const details = certType === 'Income' ? { declaredIncome: incomeValue } : {};
    const success = await requestCertificate(certType, certReason, details);

    if (success) {
      setCertReason('');
      setIncomeValue('');
      setCertSuccess('Request submitted successfully! Tracking ticket added below.');
      fetchMyResidentProfile(); // Refresh list
    }
  };

  // Helper translations for dashboard UI
  const localTrans = {
    en: {
      dashboard_title: "My Resident Dashboard",
      no_profile_title: "Claim Your Digital Pateri Identity",
      no_profile_desc: "Every citizen of Pateri village can claim their identity record, unlock access to direct panchayat services, and generate an official scan-ready Digital Resident Card.",
      btn_claim: "Claim My Resident Profile",
      mobile_lbl: "Registered Mobile Number *",
      mobile_placeholder: "Enter 10-digit mobile number",
      btn_send_otp: "Verify Mobile via OTP",
      otp_lbl: "Enter 6-digit OTP *",
      otp_desc: "Enter '123456' for verification testing.",
      btn_verify_otp: "Verify OTP Code",
      aadhaar_lbl: "Aadhaar Last 4 Digits *",
      aadhaar_placeholder: "e.g. 5741",
      btn_verify_identity: "Match Identity Record",
      found_title: "Resident Profile Found",
      found_confirm: "We matched your details against our verified village roster. Is this you?",
      btn_yes_claim: "Yes, Claim This Profile",
      btn_no_cancel: "Cancel & Retry",
      card_header: "DIGITAL PATERI RESIDENT CARD",
      card_footer: "Verified Resident of Pateri Gram Panchayat",
      sec_personal: "Personal Profile",
      sec_family: "Linked Household Family Members",
      sec_services: "Direct Village Services",
      sec_certificates: "Digital Certificates Desk",
      sec_activity: "Citizen Activity Log",
      lbl_id: "Resident ID",
      lbl_name: "Name",
      lbl_age: "Age",
      lbl_gender: "Gender",
      lbl_address: "Address",
      lbl_ward: "Ward No.",
      lbl_house: "House No.",
      lbl_blood: "Blood Group",
      lbl_occupation: "Occupation",
      lbl_education: "Education",
      lbl_voter: "Voter ID (Private)",
      lbl_aadhaar: "Aadhaar L4 (Private)",
      lbl_ration: "Ration Card (Private)",
      cert_type: "Select Certificate Type *",
      cert_reason: "Reason for Request *",
      cert_income: "Annual Declared Family Income (₹) *",
      cert_submit: "File Application Ticket",
      lbl_type: "Type",
      lbl_status: "Status",
      lbl_applied: "Applied Date",
      active_vol: "Active Volunteer",
      emerg_blood: "Emergency Blood Donor",
      panch_off: "Panchayat Official",
      verif_resident: "Verified Resident",
      no_family: "No linked family members found at this house address."
    },
    hi: {
      dashboard_title: "मेरा डिजिटल डैशबोर्ड",
      no_profile_title: "अपनी पतेरी डिजिटल पहचान का दावा करें",
      no_profile_desc: "पतेरी गाँव का प्रत्येक नागरिक अपने पहचान पत्र का दावा कर सकता है, सीधी सरकारी सेवाओं को अनलॉक कर सकता है, और एक सत्यापित डिजिटल पहचान पत्र प्राप्त कर सकता है।",
      btn_claim: "मेरी नागरिक प्रोफ़ाइल का दावा करें",
      mobile_lbl: "पंजीकृत मोबाइल नंबर *",
      mobile_placeholder: "10- अंकों का मोबाइल नंबर डालें",
      btn_send_otp: "OTP भेजें",
      otp_lbl: "6-अंकों का OTP कोड डालें *",
      otp_desc: "सत्यापन परीक्षण के लिए '123456' का उपयोग करें।",
      btn_verify_otp: "OTP सत्यापित करें",
      aadhaar_lbl: "आधार कार्ड के अंतिम 4 अंक *",
      aadhaar_placeholder: "उदा. 5741",
      btn_verify_identity: "नागरिक रिकॉर्ड मिलान करें",
      found_title: "नागरिक प्रोफाइल मिल गई",
      found_confirm: "हमने गाँव की वोटर/राशन सूची में आपके रिकॉर्ड का मिलान कर लिया है। क्या यह आप हैं?",
      btn_yes_claim: "हाँ, यह मेरी प्रोफाइल है",
      btn_no_cancel: "रद्द करें",
      card_header: "डिजिटल पतेरी नागरिक पहचान पत्र",
      card_footer: "सत्यापित नागरिक - ग्राम पंचायत पतेरी, कैमूर, बिहार",
      sec_personal: "निजी प्रोफाइल विवरण",
      sec_family: "पारिवारिक सदस्य (समान मकान नंबर)",
      sec_services: "गाँव की डिजिटल सेवाएँ",
      sec_certificates: "डिजिटल प्रमाण पत्र आवेदन पटल",
      sec_activity: "नागरिक गतिविधि इतिहास",
      lbl_id: "नागरिक आईडी",
      lbl_name: "नाम",
      lbl_age: "उम्र",
      lbl_gender: "लिंग",
      lbl_address: "पता",
      lbl_ward: "वार्ड नंबर",
      lbl_house: "मकान नंबर",
      lbl_blood: "रक्त समूह",
      lbl_occupation: "व्यवसाय",
      lbl_education: "शिक्षा",
      lbl_voter: "मतदाता पहचान पत्र (निजी)",
      lbl_aadhaar: "आधार अंतिम 4 (निजी)",
      lbl_ration: "राशन कार्ड (निजी)",
      cert_type: "प्रमाण पत्र प्रकार चुनें *",
      cert_reason: "आवेदन करने का कारण *",
      cert_income: "वार्षिक पारिवारिक घोषित आय (₹) *",
      cert_submit: "आवेदन पत्र जमा करें",
      lbl_type: "प्रकार",
      lbl_status: "स्थिति",
      lbl_applied: "आवेदन तिथि",
      active_vol: "सक्रिय स्वयंसेवक",
      emerg_blood: "आपातकालीन रक्तदाता",
      panch_off: "पंचायत अधिकारी",
      verif_resident: "सत्यापित निवासी",
      no_family: "इस मकान नंबर पर कोई अन्य सदस्य पंजीकृत नहीं हैं।"
    },
    hn: {
      dashboard_title: "My Digital Dashboard",
      no_profile_title: "Apni Pateri Digital Identity claim karein",
      no_profile_desc: "Pateri gaon ka har ek resident apne profile ko claim kar sakta hai, panchayat benefits access kar sakta hai, aur digital resident card generate kar sakta hai.",
      btn_claim: "Claim My Resident Profile",
      mobile_lbl: "Registered Mobile Number *",
      mobile_placeholder: "10-digit mobile number enter karein",
      btn_send_otp: "OTP Send karein",
      otp_lbl: "6-digit OTP Code dalein *",
      otp_desc: "Testing ke liye '123456' use karein.",
      btn_verify_otp: "OTP Verify karein",
      aadhaar_lbl: "Aadhaar ke Last 4 Digits *",
      aadhaar_placeholder: "e.g. 5741",
      btn_verify_identity: "Identity Match karein",
      found_title: "Resident Profile Mil Gayi",
      found_confirm: "Hamne verified roster me aapki profile match kar li hai. Kya ye aap hain?",
      btn_yes_claim: "Haan, Profile Claim karein",
      btn_no_cancel: "Cancel karein",
      card_header: "DIGITAL PATERI RESIDENT CARD",
      card_footer: "Verified Resident of Pateri Gram Panchayat",
      sec_personal: "Personal Profile",
      sec_family: "Household Family Members",
      sec_services: "Direct Village Services",
      sec_certificates: "Digital Certificates Desk",
      sec_activity: "Citizen Activity History",
      lbl_id: "Resident ID",
      lbl_name: "Name",
      lbl_age: "Umar",
      lbl_gender: "Gender",
      lbl_address: "Pata",
      lbl_ward: "Ward No",
      lbl_house: "House No",
      lbl_blood: "Blood Group",
      lbl_occupation: "Occupation",
      lbl_education: "Education",
      lbl_voter: "Voter ID (Private)",
      lbl_aadhaar: "Aadhaar L4 (Private)",
      lbl_ration: "Ration Card (Private)",
      cert_type: "Certificate Type select karein *",
      cert_reason: "Reason for Request *",
      cert_income: "Family Annual Income (₹) *",
      cert_submit: "Apply Ticket Submit karein",
      lbl_type: "Type",
      lbl_status: "Status",
      lbl_applied: "Applied Date",
      active_vol: "Active Volunteer",
      emerg_blood: "Emergency Blood Donor",
      panch_off: "Panchayat Official",
      verif_resident: "Verified Resident",
      no_family: "Is ghar me koi aur parivar sadasya nahi mile."
    }
  };

  const t = localTrans[language] || localTrans['en'];
  const tc = localTrans[cardLang] || localTrans['en'];

  if (!user) {
    return <div className="container" style={{ padding: 'var(--spacing-xl) 0', textAlign: 'center' }}>Redirecting to Login...</div>;
  }

  // --- RENDERING CLAIM WIZARD (IF NOT CLAIMED) ---
  if (!user.residentProfile) {
    return (
      <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
        <div style={{ maxWidth: '550px', margin: '0 auto' }}>
          
          {claimStep === 'init' && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div style={{ background: 'rgba(4, 120, 87, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'var(--primary)' }}>
                <Shield size={32} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>{t.no_profile_title}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.5' }}>
                {t.no_profile_desc}
              </p>
              
              {claimError && (
                <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{claimError}</div>
              )}

              <button onClick={() => setClaimStep('mobile')} className="btn-primary" style={{ padding: '10px 25px', fontSize: '0.95rem' }}>
                {t.btn_claim}
              </button>
            </div>
          )}

          {claimStep === 'mobile' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Step 1: Mobile Verification</h3>
                <button onClick={() => setClaimStep('init')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{t.mobile_lbl}</label>
                  <input 
                    type="tel" 
                    placeholder={t.mobile_placeholder}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px' }}
                  />
                </div>

                {claimError && <div className="alert alert-danger">{claimError}</div>}

                <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
                  {isLoading ? 'Sending...' : t.btn_send_otp}
                </button>
              </form>
            </div>
          )}

          {claimStep === 'otp' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Step 2: Enter OTP</h3>
                <button onClick={() => setClaimStep('mobile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{t.otp_lbl}</label>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={6}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>{t.otp_desc}</span>
                </div>

                {claimError && <div className="alert alert-danger">{claimError}</div>}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                  {t.btn_verify_otp}
                </button>
              </form>
            </div>
          )}

          {claimStep === 'aadhaar' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Step 3: Identity Matching</h3>
                <button onClick={() => setClaimStep('otp')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleVerifyIdentity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>{t.aadhaar_lbl}</label>
                  <input 
                    type="password" 
                    placeholder={t.aadhaar_placeholder}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={4}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', letterSpacing: '6px', fontSize: '1.2rem' }}
                  />
                </div>

                {claimError && <div className="alert alert-danger">{claimError}</div>}

                <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
                  {isLoading ? 'Matching...' : t.btn_verify_identity}
                </button>
              </form>
            </div>
          )}

          {claimStep === 'found' && foundProfile && (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{t.found_title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{t.found_confirm}</p>

              <div style={{ background: 'var(--bg-cream)', padding: '20px', borderRadius: '8px', textAlign: 'left', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border)' }}>
                <div><strong>{t.lbl_name}:</strong> {foundProfile.name}</div>
                <div><strong>Father's Name:</strong> {foundProfile.fatherName}</div>
                <div><strong>{t.lbl_ward}:</strong> {foundProfile.ward}</div>
                <div><strong>{t.lbl_house}:</strong> {foundProfile.houseNo || 'N/A'}</div>
                <div><strong>Village Name:</strong> Pateri</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleConfirmClaim} className="btn-primary" style={{ flex: 1 }}>
                  {t.btn_yes_claim}
                </button>
                <button onClick={() => { setClaimStep('mobile'); setFoundProfile(null); }} className="btn-secondary" style={{ background: '#78716c' }}>
                  {t.btn_no_cancel}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- RENDERING MAIN RESIDENT DASHBOARD ---
  if (!residentProfile) {
    return <div className="container" style={{ padding: 'var(--spacing-xl) 0', textAlign: 'center' }}>Loading profile metrics...</div>;
  }

  const { profile, familyMembers, activities } = residentProfile;

  // Generate QR Code URL linking to Public Profile Scan landing page
  const publicUrl = `${window.location.origin}/#/resident/${profile.residentId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=047857&data=${encodeURIComponent(publicUrl)}`;

  // Translation helpers for Gender symbols
  const genderSymbol = profile.gender === 'Male' ? '♂' : profile.gender === 'Female' ? '♀' : '⚦';

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-lg) 0' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>{t.dashboard_title}</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Card Language:</span>
          <select 
            value={cardLang} 
            onChange={(e) => setCardLang(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem' }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="hn">Hinglish</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: RESIDENT ID CARD & SERVICES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* DIGITAL RESIDENT CARD (NO PHOTO) */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', 
            color: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: 'var(--shadow-md)', 
            border: '2px solid #059669',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Card Background Logo Seal overlay */}
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, fontSize: '12rem', fontWeight: '900', select: 'none', pointerEvents: 'none' }}>
              P
            </div>

            {/* Logo and Seal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>BIHAR GOVERNMENT</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: '#34d399' }}>{tc.card_header}</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'white', border: '1px solid white' }}>
                P
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              
              {/* Left text Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_name}</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600' }}>{profile.name} <span style={{ color: '#34d399' }}>{genderSymbol}</span></span>
                </div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_id}</span>
                  <span style={{ fontWeight: '500', letterSpacing: '0.5px' }}>{profile.residentId}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_ward}</span>
                    <span>{profile.ward}</span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_house}</span>
                    <span>{profile.houseNo || 'N/A'}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_age}</span>
                    <span>{profile.age || (profile.dob ? (2026 - new Date(profile.dob).getFullYear()) : 'N/A')} Yrs</span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '0.75rem', display: 'block' }}>{tc.lbl_gender}</span>
                    <span>{profile.gender}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'white', padding: '8px', borderRadius: '8px' }}>
                <img 
                  src={qrCodeUrl} 
                  alt="Identity Verification QR" 
                  style={{ width: '100px', height: '100px', display: 'block' }} 
                />
                <span style={{ color: '#047857', fontSize: '0.6rem', fontWeight: 'bold' }}>SCAN TO VERIFY</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ opacity: 0.8 }}>{tc.card_footer}</span>
              
              {/* Dynamically Styled Badges on Card */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {profile.verificationStatus && <span style={{ background: '#10b981', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.6rem' }}>VERIFIED</span>}
                {activities.isVolunteer && <span style={{ background: '#3b82f6', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.6rem' }}>VOLUNTEER</span>}
              </div>
            </div>
          </div>

          {/* QUICK SERVICES */}
          <div className="glass-card">
            <h4 style={{ marginBottom: '15px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{t.sec_services}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Link to="/complaints" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px' }}>
                <AlertTriangle size={14} /> Complaints Box
              </Link>
              <Link to="/volunteer" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px' }}>
                <Users size={14} /> Help Tickets
              </Link>
              <Link to="/marketplace" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px' }}>
                <Store size={14} /> Marketplace
              </Link>
              <Link to="/documents" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px' }}>
                <FileText size={14} /> Document Vault
              </Link>
              <Link to="/agriculture" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px', gridColumn: 'span 2' }}>
                <Sprout size={14} style={{ marginRight: '2px' }} /> Krishi Hub & Mandi Rates
              </Link>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL PROFILES, FAMILY, HISTORY, CERTIFICATES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* PERSONAL DETAILS PANEL */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} /> {t.sec_personal}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_name}</span>
                <strong>{profile.name}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_id}</span>
                <strong>{profile.residentId}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_age} / {t.lbl_gender}</span>
                <strong>{profile.age || (profile.dob ? (2026 - new Date(profile.dob).getFullYear()) : 'N/A')} Yrs / {profile.gender}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_blood}</span>
                <strong style={{ color: 'var(--danger)' }}>{profile.bloodGroup || 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_occupation}</span>
                <strong>{profile.occupation || 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_education}</span>
                <strong>{profile.education || 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_ward} / {t.lbl_house}</span>
                <strong>Ward {profile.ward} / H-{profile.houseNo || 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.lbl_address}</span>
                <strong>{profile.address}</strong>
              </div>
              
              {/* Private Fields Demarcation */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', background: 'rgba(217, 119, 6, 0.04)', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold', display: 'block' }}>{t.lbl_aadhaar}</span>
                <strong>•••• •••• {profile.aadhaarLast4 || 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', background: 'rgba(217, 119, 6, 0.04)', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold', display: 'block' }}>{t.lbl_voter}</span>
                <strong>{profile.voterId ? `••••${profile.voterId.substring(profile.voterId.length - 4)}` : 'N/A'}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', background: 'rgba(217, 119, 6, 0.04)', padding: '6px', borderRadius: '4px', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold', display: 'block' }}>{t.lbl_ration}</span>
                <strong>{profile.rationCardNumber || 'N/A'} ({profile.cardType || 'N/A'})</strong>
              </div>
            </div>
          </div>

          {/* FAMILY TREE LIST */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} /> {t.sec_family}
            </h3>

            {familyMembers.length === 0 ? (
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{t.no_family}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {familyMembers.map((fam) => (
                  <div key={fam.residentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-cream)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{fam.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {fam.residentId} | {fam.gender} | {fam.age} Yrs
                      </span>
                    </div>
                    <span className="badge" style={{ background: 'rgba(4, 120, 87, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {fam.occupation || 'Resident'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CERTIFICATE REQUEST FORM & STATUS LIST */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} /> {t.sec_certificates}
            </h3>

            {certSuccess && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{certSuccess}</div>}

            <form onSubmit={handleCertificateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.cert_type}</label>
                  <select 
                    value={certType} 
                    onChange={(e) => setCertType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                  >
                    <option value="Residence">Residence Certificate</option>
                    <option value="Character">Character Certificate Request</option>
                    <option value="Income">Income Certificate Request</option>
                    <option value="NOC">NOC Requests</option>
                  </select>
                </div>
                
                {certType === 'Income' ? (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.cert_income}</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 150000"
                      value={incomeValue} 
                      onChange={(e) => setIncomeValue(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Status Log</label>
                    <input 
                      type="text" 
                      value="Digital Issuance" 
                      disabled 
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: '#f3f4f6' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.cert_reason}</label>
                <textarea 
                  rows="2" 
                  placeholder="Explain why you need this document..."
                  value={certReason}
                  onChange={(e) => setCertReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px' }}>
                <Send size={14} /> {t.cert_submit}
              </button>
            </form>

            {/* List of Issued Certificate Tickets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activities.certificates.map((cert, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{cert.type} Certificate</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                      {t.lbl_applied}: {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    color: cert.status === 'Approved' ? 'var(--success)' : cert.status === 'Rejected' ? 'var(--danger)' : 'var(--secondary)' 
                  }}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CITIZEN ACTIVITY LOG */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} /> {t.sec_activity}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Complaints submitted */}
              {activities.complaints.map((comp) => (
                <div key={comp._id} style={{ display: 'flex', gap: '10px', padding: '8px', background: 'var(--bg-cream)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <Clock size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <strong>Filed Complaint: "{comp.title}"</strong>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Category: {comp.category} | Status: {comp.status} | Date: {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Volunteer actions */}
              {activities.volunteer.map((vol) => (
                <div key={vol._id} style={{ display: 'flex', gap: '10px', padding: '8px', background: 'var(--bg-cream)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <strong>Volunteer Duty: "{vol.title}"</strong>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Category: {vol.category} | Priority: {vol.priority} | Status: {vol.status}
                    </span>
                  </div>
                </div>
              ))}

              {activities.complaints.length === 0 && activities.volunteer.length === 0 && (
                <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No recent activity logged in the system.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
