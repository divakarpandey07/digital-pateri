import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Styles
import './index.css';

// Components (We will write these in the next steps)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Pages (We will write these in the next steps)
import Home from './pages/Home';
import About from './pages/About';
import Directory from './pages/Directory';
import Complaints from './pages/Complaints';
import Jobs from './pages/Jobs';
import Health from './pages/Health';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import Volunteer from './pages/Volunteer';
import Documents from './pages/Documents';
import Agriculture from './pages/Agriculture';
import Dashboard from './pages/Dashboard';
import ResidentPublic from './pages/ResidentPublic';
import PanchayatLeadership from './pages/PanchayatLeadership';
import SearchResident from './pages/SearchResident';
import TimelineAchievements from './pages/TimelineAchievements';
import Registry from './pages/Registry';
import Demographics from './pages/Demographics';
import SOS from './pages/SOS';
import DigitalArchive from './pages/DigitalArchive';

function App() {
  const { user, fetchVillageId, fetchVillageDetails, villageId, welcomeMessage, clearWelcomeMessage } = useStore();

  useEffect(() => {
    // Load default village details on startup (Pateri ID: PAT-821106)
    // We fetch details for Pateri using the village ID from store
    fetchVillageDetails(villageId);
  }, [villageId]);

  return (
    <Router>
      <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Global Responsive Navigation bar */}
        <Navbar />

        {/* Core Main page container */}
        <main className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/search-residents" element={<SearchResident />} />
            <Route path="/leadership" element={<PanchayatLeadership />} />
            <Route path="/timeline" element={<TimelineAchievements />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/demographics" element={<Demographics />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/archive" element={<DigitalArchive />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/health" element={<Health />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/agriculture" element={<Agriculture />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resident/:residentId" element={<ResidentPublic />} />
            
            {/* Protected Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r)) ? (
                  <Admin />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>

        {/* Floating AI Chatbot Assistant drawer */}
        <Chatbot />

        {/* Global Footer */}
        <Footer />
      </div>

      {welcomeMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 250, 0.95))',
            border: '1px solid rgba(4, 120, 87, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            color: '#1e293b',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 15px', color: '#047857', fontFamily: 'var(--font-serif)' }}>
              स्वागत है! / Welcome!
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-line', margin: '0 0 25px', color: '#334155' }}>
              {welcomeMessage}
            </p>
            <button 
              onClick={clearWelcomeMessage}
              style={{
                backgroundColor: '#047857',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 30px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(4, 120, 87, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#065f46'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#047857'}
            >
              ठीक है / Continue
            </button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
