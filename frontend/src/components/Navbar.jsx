import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Home, Info, BookOpen, AlertTriangle, Briefcase, Heart, Settings, LogOut, LogIn, Store, Users, FolderOpen, Sprout, BarChart3, FileText, ShieldAlert, Archive, Calendar } from 'lucide-react';
import { translations } from '../utils/translations';

function Navbar() {
  const { user, logout, language, setLanguage } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo and Branding */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-seal">P</div>
          <span>Digital Pateri</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <Home size={14} /> {translations[language]?.nav_home || 'Home'}
          </Link>
          
          {/* Roster & Directory Dropdown */}
          <div className="nav-dropdown">
            <div className="nav-dropdown-toggle">
              <Users size={14} /> {language === 'hi' ? 'नागरिक निर्देशिका' : 'Directory'}
            </div>
            <div className="nav-dropdown-menu">
              <Link to="/search-residents" className="nav-dropdown-item">
                <BookOpen size={13} /> {language === 'hi' ? 'खोज सूची' : 'Search Roster'}
              </Link>
              <Link to="/leadership" className="nav-dropdown-item">
                <Users size={13} /> {translations[language]?.nav_leadership || 'Panchayat Leaders'}
              </Link>
              <Link to="/volunteer" className="nav-dropdown-item">
                <Users size={13} /> {language === 'hi' ? 'स्वयंसेवक' : 'Volunteers'}
              </Link>
            </div>
          </div>

          {/* Panchayat Services Dropdown */}
          <div className="nav-dropdown">
            <div className="nav-dropdown-toggle">
              <FileText size={14} /> {language === 'hi' ? 'पंचायत सेवाएं' : 'Services'}
            </div>
            <div className="nav-dropdown-menu">
              <Link to="/registry" className="nav-dropdown-item">
                <FileText size={13} /> {language === 'hi' ? 'जन्म-मृत्यु' : 'Birth & Death'}
              </Link>
              <Link to="/demographics" className="nav-dropdown-item">
                <BarChart3 size={13} /> {language === 'hi' ? 'जनगणना सांख्यिकी' : 'Census Stats'}
              </Link>
              <Link to="/timeline" className="nav-dropdown-item">
                <Calendar size={13} /> {language === 'hi' ? 'विकास घटनाक्रम' : 'Timeline'}
              </Link>
              <Link to="/archive" className="nav-dropdown-item">
                <Archive size={13} /> {language === 'hi' ? 'ग्राम अभिलेखागार' : 'Archive'}
              </Link>
            </div>
          </div>

          {/* Agriculture & Mandi Dropdown */}
          <div className="nav-dropdown">
            <div className="nav-dropdown-toggle">
              <Sprout size={14} /> {language === 'hi' ? 'कृषि एवं मंडी' : 'Krishi & Mandi'}
            </div>
            <div className="nav-dropdown-menu">
              <Link to="/agriculture" className="nav-dropdown-item">
                <Sprout size={13} /> Krishi Hub
              </Link>
              <Link to="/marketplace" className="nav-dropdown-item">
                <Store size={13} /> Mandi P2P
              </Link>
            </div>
          </div>

          {/* SOS Alert Button */}
          <Link to="/sos" className="nav-sos-btn">
            <ShieldAlert size={14} /> SOS
          </Link>

          {/* User Dashboard Access */}
          {user && (
            <Link to="/dashboard" className="nav-link" style={{ color: 'var(--primary)', fontWeight: '700' }}>
              {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
            </Link>
          )}

          {/* Admin Panel Access */}
          {isAdmin && (
            <Link to="/admin" className="nav-link" style={{ color: 'var(--secondary)', fontWeight: '700' }}>
              {translations[language]?.nav_admin || 'Admin Portal'}
            </Link>
          )}

          {/* Language Switcher Dropdown */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="nav-select"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="hn">Hinglish</option>
          </select>

          {/* User Auth Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="btn-secondary nav-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary nav-btn" style={{ textDecoration: 'none', color: 'white', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogIn size={14} /> Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
