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
  const { user, fetchVillageId, fetchVillageDetails, villageId } = useStore();

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
    </Router>
  );
}

export default App;
