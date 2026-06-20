import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { translations } from '../utils/translations';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [voterId, setVoterId] = useState('');
  const [mobile, setMobile] = useState('');

  const { login, register, error, isLoading, language } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegister) {
      if (!name) return;
      if (!voterId && !ward) {
        alert(language === 'hi' 
          ? 'कृपया सत्यापन के लिए वोटर आईडी या वार्ड नंबर में से कोई एक प्रदान करें।' 
          : language === 'hn' 
          ? 'Please profile verification ke liye Voter ID card number ya Ward number fill karein.' 
          : 'Please provide either Voter ID Card Number or Ward Number for profile verification.');
        return;
      }
      const success = await register(name, email, password, ward, voterId, mobile);
      if (success) navigate('/');
    } else {
      const success = await login(email, password);
      if (success) navigate('/');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl) 0', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', animation: 'fadeIn 0.5s ease' }}>
      
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(4, 120, 87, 0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: 'var(--primary)' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>
            {isRegister
              ? (language === 'hi' ? 'नागरिक पंजीकरण' : language === 'hn' ? 'Resident Registration' : 'Resident Registration')
              : (language === 'hi' ? 'पतेरी पोर्टल लॉगिन' : language === 'hn' ? 'Pateri Portal Login' : 'Pateri Portal Login')}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isRegister
              ? (language === 'hi' ? 'अपने नागरिक कार्ड को लॉगिन क्रेडेंशियल से लिंक करें' : language === 'hn' ? 'Apne resident card ko login credentials se link karein' : 'Link your resident card to login credentials')
              : (language === 'hi' ? 'शिकायतें, सूचना पट्ट और प्रशासन पैनल तक पहुँचें' : language === 'hn' ? 'Complaints, notice boards, aur admin panels access karein' : 'Access complaints, notice boards, and administration panels')}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: '0.8rem', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                {language === 'hi' ? 'पूरा नाम (वोटर लिस्ट के अनुसार) *' : language === 'hn' ? 'Full Name (Voter list ke hisab se) *' : 'Full Name (As in voter list) *'}
              </label>
              <input 
                type="text" 
                placeholder={language === 'hi' ? 'उदा. हैदर अली' : language === 'hn' ? 'E.g. Haidar Ali' : 'E.g. Haidar Ali'} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {language === 'hi' ? 'ईमेल पता *' : language === 'hn' ? 'Email Address *' : 'Email Address *'}
            </label>
            <input 
              type="email" 
              placeholder="name@pateri.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {language === 'hi' ? 'पासवर्ड *' : language === 'hn' ? 'Password *' : 'Password *'}
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  {language === 'hi' ? 'वोटर आईडी कार्ड नंबर (EPIC)' : language === 'hn' ? 'Voter ID Card Number (EPIC)' : 'Voter ID Card Number (EPIC)'}
                </label>
                <input 
                  type="text" 
                  placeholder="E.g. EPIC9999IN" 
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '5px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                {language === 'hi' ? '-- या --' : language === 'hn' ? '-- Ya --' : '-- OR --'}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  {language === 'hi' ? 'वार्ड नंबर' : language === 'hn' ? 'Ward Number' : 'Ward Number'}
                </label>
                <input 
                  type="text" 
                  placeholder="E.g. 01, 02, 03" 
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  {language === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : language === 'hn' ? 'Mobile Number (Optional)' : 'Mobile Number (Optional)'}
                </label>
                <input 
                  type="tel" 
                  placeholder="E.g. 9876543210" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={10}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                  {language === 'hi' ? 'यह नंबर आपकी profile में save हो जाएगा' : language === 'hn' ? 'Yeh number aapki profile mein save ho jayega' : 'This will be saved to your resident profile'}
                </span>
              </div>

              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                {language === 'hi'
                  ? '* अपनी सही जानकारी भरें ताकि आपके सरकारी रिकॉर्ड मैच हो सकें।'
                  : language === 'hn'
                  ? '* Apni sahi details bharein taaki government records match ho sakein.'
                  : '* Enter accurate info to map your profile to voter roster.'}
              </span>
            </>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '10px', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            {isLoading
              ? (language === 'hi' ? 'प्रक्रिया जारी है...' : language === 'hn' ? 'Processing...' : 'Processing...')
              : isRegister
              ? (language === 'hi' ? 'खाता पंजीकृत करें' : language === 'hn' ? 'Register Account' : 'Register Account')
              : (language === 'hi' ? 'सुरक्षित लॉगिन' : language === 'hn' ? 'Login Securely' : 'Login Securely')}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              {language === 'hi' ? 'पहले से खाता है?' : language === 'hn' ? 'Already account hai?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                {language === 'hi' ? 'यहाँ लॉगिन करें' : language === 'hn' ? 'Login karein' : 'Login here'}
              </button>
            </span>
          ) : (
            <span>
              {language === 'hi' ? 'नए नागरिक?' : language === 'hn' ? 'New resident?' : 'New resident?'}{' '}
              <button type="button" onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                {language === 'hi' ? 'यहाँ पंजीकरण करें' : language === 'hn' ? 'Register here' : 'Register here'}
              </button>
            </span>
          )}
        </div>

      </div>

    </div>
  );
}

export default Login;
