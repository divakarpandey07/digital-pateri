import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import QRCard from '../components/QRCard';
import { Search, UserCheck, Phone, MapPin, Award, X, Users, BookOpen } from 'lucide-react';
import { translations } from '../utils/translations';

function Directory() {
  const { villageId, language } = useStore();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [mohalla, setMohalla] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [education, setEducation] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isBloodDonor, setIsBloodDonor] = useState(false);
  const [volunteerType, setVolunteerType] = useState('');

  const [selectedResident, setSelectedResident] = useState(null);
  const [fullResident, setFullResident] = useState(null);
  const [modalTab, setModalTab] = useState('card');
  const [modalLoading, setModalLoading] = useState(false);

  const handleOpenModal = async (resident) => {
    setSelectedResident(resident);
    setFullResident(null);
    setModalTab('card');
    setModalLoading(true);
    try {
      const res = await axios.get(`/api/v1/residents/${resident._id}`);
      setFullResident(res.data.data);
    } catch (err) {
      console.error('Failed to fetch full resident details', err);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        villageId,
        page,
        limit: 8
      });
      if (search) params.append('search', search);
      if (mohalla) params.append('mohalla', mohalla);
      if (occupation) params.append('occupation', occupation);
      if (bloodGroup) params.append('bloodGroup', bloodGroup);
      if (education) params.append('education', education);
      if (isVolunteer) params.append('isVolunteer', 'true');
      if (isBloodDonor) params.append('isBloodDonor', 'true');
      if (volunteerType) params.append('volunteerType', volunteerType);

      const res = await axios.get(`/api/v1/residents?${params.toString()}`);
      setResidents(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    setSearch('');
    
    if (catId === 'all') {
      setOccupation('');
      setIsVolunteer(false);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'farmer') {
      setOccupation('Farmer');
      setIsVolunteer(false);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'teacher') {
      setOccupation('Teacher');
      setIsVolunteer(false);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'student') {
      setOccupation('Student');
      setIsVolunteer(false);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'shopowner') {
      setOccupation('Shop Owner');
      setIsVolunteer(false);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'volunteer') {
      setOccupation('');
      setIsVolunteer(true);
      setIsBloodDonor(false);
      setVolunteerType('');
    } else if (catId === 'donor') {
      setOccupation('');
      setIsVolunteer(false);
      setIsBloodDonor(true);
      setVolunteerType('');
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchDirectory();
    }
  }, [villageId, page, mohalla, occupation, bloodGroup, education, isVolunteer, isBloodDonor, volunteerType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDirectory();
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <BookOpen size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{translations[language]?.dir_title || 'Pateri Resident Directory'}</h1>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '25px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { id: 'all', label: language === 'hi' ? 'सभी नागरिक' : language === 'hn' ? 'Sabhi Residents' : 'All Residents', emoji: '👥' },
          { id: 'farmer', label: language === 'hi' ? 'किसान' : language === 'hn' ? 'Kisan' : 'Farmers', emoji: '🌾' },
          { id: 'teacher', label: language === 'hi' ? 'शिक्षक' : language === 'hn' ? 'Teacher' : 'Teachers', emoji: '🎓' },
          { id: 'student', label: language === 'hi' ? 'छात्र' : language === 'hn' ? 'Student' : 'Students', emoji: '✏️' },
          { id: 'shopowner', label: language === 'hi' ? 'दुकानदार' : language === 'hn' ? 'Dukandar' : 'Shop Owners', emoji: '🏪' },
          { id: 'volunteer', label: language === 'hi' ? 'स्वयंसेवक' : language === 'hn' ? 'Volunteer' : 'Volunteers', emoji: '🤝' },
          { id: 'donor', label: language === 'hi' ? 'रक्तदाता' : language === 'hn' ? 'Rakt Data' : 'Blood Donors', emoji: '🩸' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '24px',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--primary)' : 'var(--bg-cream)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-dark)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              fontWeight: '600',
              boxShadow: activeCategory === cat.id ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Filters Form */}
      <div className="glass-card" style={{ marginBottom: '25px', padding: '15px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          
          {/* Text Search */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'नाम / कौशल खोजें' : language === 'hn' ? 'Name / Skill search' : 'Search Name / Skill'}</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={translations[language]?.dir_placeholder || 'E.g. Ramesh'} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Mohalla Filter */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'टोला / मोहल्ला' : language === 'hn' ? 'Mohalla' : 'Mohalla'}</label>
            <select 
              value={mohalla}
              onChange={(e) => setMohalla(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
            >
              <option value="">{language === 'hi' ? 'सभी मोहल्ले' : language === 'hn' ? 'All Mohallas' : 'All Mohallas'}</option>
              <option value="Pateri Tola">{language === 'hi' ? 'पतेरी टोला' : 'Pateri Tola'}</option>
              <option value="Chamar Tola">{language === 'hi' ? 'चमार टोला' : 'Chamar Tola'}</option>
              <option value="Ahir Tola">{language === 'hi' ? 'अहीर टोला' : 'Ahir Tola'}</option>
              <option value="School Tola">{language === 'hi' ? 'स्कूल टोला' : 'School Tola'}</option>
              <option value="Panchayat Bhawan area">{language === 'hi' ? 'पंचायत भवन क्षेत्र' : 'Panchayat Bhawan area'}</option>
            </select>
          </div>

          {/* Occupation Filter (Only visible if activeCategory is 'all') */}
          {activeCategory === 'all' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'व्यवसाय' : language === 'hn' ? 'Occupation' : 'Occupation'}</label>
              <select 
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
              >
                <option value="">{language === 'hi' ? 'सभी व्यवसाय' : language === 'hn' ? 'All Professions' : 'All Professions'}</option>
                <option value="Farmer">{language === 'hi' ? 'किसान' : language === 'hn' ? 'Farmer' : 'Farmer'}</option>
                <option value="Teacher">{language === 'hi' ? 'शिक्षक' : language === 'hn' ? 'Teacher' : 'Teacher'}</option>
                <option value="Doctor">{language === 'hi' ? 'चिकित्सक' : language === 'hn' ? 'Doctor' : 'Doctor'}</option>
                <option value="Electrician">{language === 'hi' ? 'बिजली मिस्त्री' : language === 'hn' ? 'Electrician' : 'Electrician'}</option>
                <option value="Student">{language === 'hi' ? 'छात्र' : language === 'hn' ? 'Student' : 'Student'}</option>
                <option value="Shop Owner">{language === 'hi' ? 'दुकानदार' : language === 'hn' ? 'Shopkeeper' : 'Shopkeeper'}</option>
                <option value="Laborer">{language === 'hi' ? 'मज़दूर' : language === 'hn' ? 'Laborer' : 'Laborer'}</option>
              </select>
            </div>
          )}

          {/* Blood Group Filter */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{translations[language]?.label_blood_group || 'Blood Group'}</label>
            <select 
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
            >
              <option value="">{language === 'hi' ? 'सभी रक्त समूह' : language === 'hn' ? 'All Blood Groups' : 'All Blood Groups'}</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="O+">O+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
            </select>
          </div>

          {/* Education Filter */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'शिक्षा' : language === 'hn' ? 'Education' : 'Education'}</label>
            <select 
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
            >
              <option value="">{language === 'hi' ? 'सभी शिक्षा स्तर' : language === 'hn' ? 'All Education' : 'All Education'}</option>
              <option value="High School">{language === 'hi' ? 'मैट्रिक (High School)' : 'High School'}</option>
              <option value="Intermediate">{language === 'hi' ? 'इंटरमीडिएट' : 'Intermediate'}</option>
              <option value="Graduate">{language === 'hi' ? 'स्नातक (Graduate)' : 'Graduate'}</option>
              <option value="Postgraduate">{language === 'hi' ? 'परास्नातक (Postgraduate)' : 'Postgraduate'}</option>
              <option value="B.Ed.">B.Ed.</option>
              <option value="M.B.B.S.">M.B.B.S.</option>
            </select>
          </div>

          {/* Volunteer Type Filter (Only visible if category is 'volunteer') */}
          {activeCategory === 'volunteer' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '500', display: 'block', marginBottom: '4px' }}>{language === 'hi' ? 'स्वयंसेवक प्रकार' : language === 'hn' ? 'Volunteer Type' : 'Volunteer Type'}</label>
              <select 
                value={volunteerType}
                onChange={(e) => setVolunteerType(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
              >
                <option value="">{language === 'hi' ? 'सभी प्रकार' : language === 'hn' ? 'All Types' : 'All Types'}</option>
                <option value="Education">{language === 'hi' ? 'शिक्षा' : 'Education'}</option>
                <option value="Health">{language === 'hi' ? 'स्वास्थ्य' : 'Health'}</option>
                <option value="Disaster Relief">{language === 'hi' ? 'आपदा प्रबंधन' : 'Disaster Relief'}</option>
                <option value="Blood Donation">{language === 'hi' ? 'रक्तदान' : 'Blood Donation'}</option>
                <option value="Social Service">{language === 'hi' ? 'समाज सेवा' : 'Social Service'}</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
            {translations[language]?.btn_search || 'Apply Filter'}
          </button>

        </form>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>{language === 'hi' ? 'नागरिक सूची लोड हो रही है...' : language === 'hn' ? 'Directory load ho rahi hai...' : 'Loading Village Directory...'}</div>
      ) : (
        <>
          <div className="directory-grid">
            {residents.map(resident => (
              <div key={resident._id} className="glass-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div 
                    className="resident-avatar" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '28px', 
                      backgroundColor: resident.gender === 'Male' ? '#eff6ff' : '#fdf2f8', 
                      color: resident.gender === 'Male' ? '#2563eb' : '#db2777',
                      border: `2px solid ${resident.gender === 'Male' ? '#bfdbfe' : '#fbcfe8'}`,
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    {resident.gender === 'Male' ? '♂' : '♀'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>{resident.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {language === 'hi' && resident.occupation === 'Farmer' ? 'किसान' :
                       language === 'hi' && resident.occupation === 'Student' ? 'छात्र' :
                       language === 'hi' && resident.occupation === 'Doctor' ? 'चिकित्सक' :
                       language === 'hi' && resident.occupation === 'Electrician' ? 'बिजली मिस्त्री' :
                       language === 'hi' && resident.occupation === 'Teacher' ? 'शिक्षक' :
                       resident.occupation} | {translations[language]?.label_ward || 'Ward'} {resident.ward}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--text-dark)' }}>
                  <div>{translations[language]?.label_age || 'Age'}: <strong>{2026 - new Date(resident.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : language === 'hn' ? 'Saal' : 'Years'}</strong></div>
                  <div>{translations[language]?.label_father_husband || 'Father/Husband Name'}: <strong>{resident.fatherName || 'N/A'}</strong></div>
                  <div>{translations[language]?.label_house_no || 'House No'}: <strong>{resident.address || 'N/A'}</strong></div>
                  <div>{translations[language]?.label_ward || 'Ward'}: <strong>{resident.ward}</strong></div>
                </div>

                <button 
                  onClick={() => handleOpenModal(resident)} 
                  className="btn-outline" 
                  style={{ width: '100%', padding: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <UserCheck size={14} style={{ margin: 'auto' }} /> {translations[language]?.btn_view_id || 'View Digital ID'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyCenter: 'center', gap: '10px', marginTop: '25px', justifyContent: 'center' }}>
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1}
                className="btn-secondary" 
                style={{ opacity: page === 1 ? 0.5 : 1, padding: '6px 12px' }}
              >
                {language === 'hi' ? 'पिछला' : language === 'hn' ? 'Pichhla' : 'Previous'}
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.9rem' }}>
                {language === 'hi' ? `पृष्ठ ${page} का ${totalPages}` : language === 'hn' ? `Page ${page} of ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                disabled={page === totalPages}
                className="btn-secondary" 
                style={{ opacity: page === totalPages ? 0.5 : 1, padding: '6px 12px' }}
              >
                {language === 'hi' ? 'अगला' : language === 'hn' ? 'Agla' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Digital ID Verification Modal popup */}
      {selectedResident && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="glass-card" style={{ background: 'white', maxWidth: '460px', width: '95%', position: 'relative', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <button 
              onClick={() => { setSelectedResident(null); setFullResident(null); }} 
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            {/* Modal Header */}
            <h3 style={{ marginBottom: '15px', textAlign: 'center', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
              {language === 'hi' ? 'ग्रामीण सत्यापन हब' : language === 'hn' ? 'Resident Verification Hub' : 'Resident Verification Hub'}
            </h3>

            {/* Tab switchers */}
            <div style={{ display: 'flex', background: 'var(--bg-cream)', padding: '4px', borderRadius: '6px', gap: '4px', marginBottom: '15px' }}>
              <button 
                onClick={() => setModalTab('card')}
                style={{ flex: 1, border: 'none', padding: '8px', borderRadius: '4px', background: modalTab === 'card' ? 'white' : 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                {language === 'hi' ? 'पहचान पत्र' : language === 'hn' ? 'ID Card' : 'ID Card'}
              </button>
              <button 
                onClick={() => setModalTab('voter')}
                style={{ flex: 1, border: 'none', padding: '8px', borderRadius: '4px', background: modalTab === 'voter' ? 'white' : 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                {language === 'hi' ? 'मतदाता सूची' : language === 'hn' ? 'Voter Roll' : 'Voter Roll'}
              </button>
              <button 
                onClick={() => setModalTab('ration')}
                style={{ flex: 1, border: 'none', padding: '8px', borderRadius: '4px', background: modalTab === 'ration' ? 'white' : 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                {language === 'hi' ? 'राशन कार्ड' : language === 'hn' ? 'Ration Card' : 'Ration Card'}
              </button>
            </div>

            {/* Tab Content 1: ID Card */}
            {modalTab === 'card' && (
              <QRCard resident={selectedResident} />
            )}

            {/* Tab Content 2: Voter Roll */}
            {modalTab === 'voter' && (
              <div style={{ border: '2px solid #ea580c', background: '#fffaf8', borderRadius: '8px', padding: '15px', color: 'var(--text-dark)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, pointerEvents: 'none' }}>
                  <UserCheck size={120} color="#ea580c" />
                </div>
                
                {/* Header */}
                <div style={{ borderBottom: '2px solid #ea580c', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ea580c', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {language === 'hi' ? 'निर्वाचक नामावली - बिहार सरकार' : language === 'hn' ? 'Electoral Roll - Govt. of Bihar' : 'Electoral Roll - Govt. of Bihar'}
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#c2410c' }}>{language === 'hi' ? 'चाँद ब्लॉक | भाग संख्या 180 (पतेरी)' : language === 'hn' ? 'Chand Block | Part No. 180 (Pateri)' : 'Chand Block | Part No. 180 (Pateri)'}</strong>
                </div>

                {/* Details layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 15px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'मतदाता पहचान पत्र संख्या' : language === 'hn' ? 'Voter EPIC Number' : 'Voter EPIC Number'}</span>
                    <strong style={{ color: '#ea580c', fontSize: '0.9rem' }}>
                      {`PAT/${selectedResident.ward || '04'}/${selectedResident.residentId?.split('-')?.[2] || '0001'}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'क्रम संख्या' : language === 'hn' ? 'Serial Number' : 'Serial Number'}</span>
                    <strong>{parseInt(selectedResident.residentId?.split('-')?.[2] || '1') * 7 + 12}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'नागरिक का नाम' : language === 'hn' ? 'Resident Name' : 'Resident\'s Name'}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedResident.name}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{translations[language]?.label_father_husband || 'Father/Husband Name'}</span>
                    <strong>{selectedResident.fatherName || 'Late Father'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{translations[language]?.label_house_no || 'House Number'}</span>
                    <strong>{selectedResident.address?.match(/House No\.\s*(\d+)/)?.[1] || '101'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{translations[language]?.label_ward || 'Ward Number'}</span>
                    <strong>{selectedResident.ward}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{translations[language]?.label_age || 'Age'}</span>
                    <strong>{2026 - new Date(selectedResident.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : language === 'hn' ? 'Saal' : 'Years'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{translations[language]?.label_gender || 'Gender'}</span>
                    <strong>{language === 'hi' && selectedResident.gender === 'Male' ? 'पुरुष' : language === 'hi' && selectedResident.gender === 'Female' ? 'महिला' : selectedResident.gender}</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #fed7aa', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>{language === 'hi' ? 'विधानसभा निर्वाचन क्षेत्र' : language === 'hn' ? 'Assembly Constituency' : 'Assembly Constituency'}: <strong>204 - Chainpur (SC)</strong></div>
                    <div>{language === 'hi' ? 'मतदान केंद्र' : language === 'hn' ? 'Polling Booth' : 'Polling Booth'}: <strong>{language === 'hi' ? 'राजकीय मध्य विद्यालय, पतेरी' : 'Rajkiya Madhya Vidyalaya, Pateri'}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Ration Card */}
            {modalTab === 'ration' && (
              <div style={{ border: '2px solid #2563eb', background: '#f8fafc', borderRadius: '8px', padding: '15px', color: 'var(--text-dark)', position: 'relative' }}>
                
                {/* Header */}
                <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {language === 'hi' ? 'राशन कार्ड विवरण - ई-पीडीएस बिहार' : language === 'hn' ? 'EPDS Bihar Ration Card Details' : 'EPDS Bihar Ration Card Details'}
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#1e40af' }}>{language === 'hi' ? 'खाद्य एवं उपभोक्ता संरक्षण विभाग' : language === 'hn' ? 'Food & Consumer Protection Dept.' : 'Food & Consumer Protection Dept.'}</strong>
                </div>

                {/* Details layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px 15px', fontSize: '0.8rem', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'राशन कार्ड संख्या' : language === 'hn' ? 'Ration Card Number' : 'Ration Card Number'}</span>
                    <strong style={{ color: '#2563eb', fontSize: '0.85rem' }}>
                      {selectedResident.rationCardNumber || `10240081240100${selectedResident.residentId?.split('-')?.[2] || '0001'}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'कार्ड श्रेणी' : language === 'hn' ? 'Card Category' : 'Card Category'}</span>
                    <strong style={{ color: selectedResident.cardType === 'AAY' ? '#dc2626' : '#16a34a' }}>
                      {selectedResident.cardType || (selectedResident.occupation === 'Laborer' ? 'AAY (Antyodaya)' : 'PHH (Priority)')}
                    </strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'परिवार के मुखिया का नाम' : language === 'hn' ? 'Family Head Name' : 'Family Head Name'}</span>
                    <strong>{selectedResident.fatherName || selectedResident.name}</strong>
                  </div>
                  {selectedResident.fpsDealer && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{language === 'hi' ? 'उचित मूल्य दुकानदार' : language === 'hn' ? 'FPS Dealer Name' : 'FPS Dealer Name'}</span>
                      <strong>{selectedResident.fpsDealer}</strong>
                    </div>
                  )}
                </div>

                {/* Family Members list */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px', color: '#1e40af' }}>
                    {language === 'hi' ? 'राशन परिवार के सदस्य:' : language === 'hn' ? 'Ration Family Tree Members:' : 'Ration Family Tree Members:'}
                  </strong>
                  
                  {modalLoading ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>{language === 'hi' ? 'परिवार के सदस्यों को लोड किया जा रहा है...' : language === 'hn' ? 'Family members load ho rahe hain...' : 'Loading household members...'}</div>
                  ) : (!fullResident || !fullResident.relations || fullResident.relations.length === 0) ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '16px', 
                          backgroundColor: selectedResident.gender === 'Male' ? '#eff6ff' : '#fdf2f8', 
                          color: selectedResident.gender === 'Male' ? '#2563eb' : '#db2777',
                          border: `1px solid ${selectedResident.gender === 'Male' ? '#bfdbfe' : '#fbcfe8'}`,
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        {selectedResident.gender === 'Male' ? '♂' : '♀'}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.8rem' }}>
                        <strong>{selectedResident.name} ({language === 'hi' ? 'मुखिया' : 'Head'})</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{translations[language]?.label_age || 'Age'}: {2026 - new Date(selectedResident.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : 'Yr'} | {language === 'hi' ? 'स्वयं' : 'Self'}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                      {/* Self */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div 
                          style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '14px', 
                            backgroundColor: selectedResident.gender === 'Male' ? '#eff6ff' : '#fdf2f8', 
                            color: selectedResident.gender === 'Male' ? '#2563eb' : '#db2777',
                            border: `1px solid ${selectedResident.gender === 'Male' ? '#bfdbfe' : '#fbcfe8'}`,
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}
                        >
                          {selectedResident.gender === 'Male' ? '♂' : '♀'}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.8rem' }}>
                          <strong style={{ fontSize: '0.8rem' }}>{selectedResident.name}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{translations[language]?.label_age || 'Age'}: {2026 - new Date(selectedResident.dob).getFullYear()} {language === 'hi' ? 'वर्ष' : 'Yr'} | {language === 'hi' ? 'स्वयं (मुखिया)' : 'Self (Head)'}</div>
                        </div>
                      </div>
                      
                      {/* Family members mapped via relations */}
                      {fullResident.relations.map((rel, index) => {
                        const relative = rel.relativeId;
                        if (!relative) return null;
                        
                        let relName = rel.relationType;
                        if (language === 'hi') {
                          if (rel.relationType === 'Father') relName = 'पिता';
                          else if (rel.relationType === 'Mother') relName = 'माता';
                          else if (rel.relationType === 'Spouse') relName = 'पति/पत्नी';
                          else if (rel.relationType === 'Child') relName = 'बेटा/बेटी';
                          else if (rel.relationType === 'Sibling') relName = 'भाई/बहन';
                        } else if (language === 'hn') {
                          if (rel.relationType === 'Father') relName = 'Papa';
                          else if (rel.relationType === 'Mother') relName = 'Mummy';
                          else if (rel.relationType === 'Spouse') relName = 'Spouse';
                          else if (rel.relationType === 'Child') relName = 'Bachha';
                          else if (rel.relationType === 'Sibling') relName = 'Bhai/Behan';
                        }

                        return (
                          <div key={index} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div 
                              style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '14px', 
                                backgroundColor: relative.gender === 'Male' ? '#eff6ff' : '#fdf2f8', 
                                color: relative.gender === 'Male' ? '#2563eb' : '#db2777',
                                border: `1px solid ${relative.gender === 'Male' ? '#bfdbfe' : '#fbcfe8'}`,
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}
                            >
                              {relative.gender === 'Male' ? '♂' : '♀'}
                            </div>
                            <div style={{ flex: 1, fontSize: '0.8rem' }}>
                              <strong style={{ fontSize: '0.8rem' }}>{relative.name}</strong>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {language === 'hi' && relative.occupation === 'Farmer' ? 'किसान' :
                                 language === 'hi' && relative.occupation === 'Student' ? 'छात्र' :
                                 relative.occupation} | {language === 'hi' ? 'संबंध' : language === 'hn' ? 'Relation' : 'Relation'}: {relName}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Directory;
