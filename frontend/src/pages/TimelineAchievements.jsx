import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Calendar, Award, Compass, Star, User, Image, ChevronLeft, ChevronRight, X, Download, Maximize2 } from 'lucide-react';

const memoriesImages = [
  {
    src: '/assets/memories/holi_temple.jpg',
    title: {
      hi: 'पतेरी शिव मंदिर अग्रभाग',
      en: 'Pateri Shiv Mandir Frontage',
      hn: 'Pateri Shiv Mandir Frontage'
    },
    desc: {
      hi: 'गाँव का ऐतिहासिक शिव मंदिर जिसे त्योहारों में सजाया जाता है।',
      en: 'The historical Shiv Mandir of Pateri decorated during local festivals.',
      hn: 'Gaon ka aitihasik Shiv Mandir jise tyoharo me sajaya jata hai.'
    }
  },
  {
    src: '/assets/memories/holi_selfie.jpg',
    title: {
      hi: 'रंगों का त्योहार - युवा टोली',
      en: 'Festival of Colors - Youth Group',
      hn: 'Rangon ka Tyohar - Yuva Toli'
    },
    desc: {
      hi: 'गाँव के युवाओं द्वारा उत्साहपूर्वक खेली गई होली की एक यादगार सेल्फी।',
      en: 'A joyful selfie of village youth celebrating Holi with colors.',
      hn: 'Gaon ke yuvaon dwara utsahpurvak kheli gayi Holi ki ek yaadgar selfie.'
    }
  },
  {
    src: '/assets/memories/holi_play1.jpg',
    title: {
      hi: 'पारंपरिक होली मिलन - पी.के. डीजे',
      en: 'Traditional Holi Milan - P.K. DJ',
      hn: 'Paramparik Holi Milan - P.K. DJ'
    },
    desc: {
      hi: 'गाँव की गलियों में संगीत (DJ) की धुन पर पानी और रंगों की बौछार।',
      en: 'Water splashing and dance celebrations with music beats on Pateri streets.',
      hn: 'Gaon ki galiyon me music (DJ) ki dhun par paani aur rangon ki bauchar.'
    }
  },
  {
    src: '/assets/memories/holi_play2.jpg',
    title: {
      hi: 'सामुदायिक सौहार्द एवं उत्सव',
      en: 'Community Harmony & Celebration',
      hn: 'Samudayik Sauhard aur Utsav'
    },
    desc: {
      hi: 'बिना किसी भेदभाव के संपूर्ण गाँव द्वारा मनाया जाने वाला भाईचारे का प्रतीक उत्सव।',
      en: 'Residents celebrating Holi together, fostering community brotherhood and joy.',
      hn: 'Bina kisi bhedbhav ke pure gaon dwara manaya jaane wala bhaichare ka prateek utsav.'
    }
  },
  {
    src: '/assets/memories/holi_play3.jpg',
    title: {
      hi: 'उमंग और उल्लास की लहर',
      en: 'Wave of Joy & Enthusiasm',
      hn: 'Umang aur Ullas ki Lahar'
    },
    desc: {
      hi: 'रंग-बिरंगे पलों में डूबे ग्रामीण, पारंपरिक भोजपुरी होली गीतों पर थिरकते हुए।',
      en: 'Villagers dancing to traditional Bhojpuri Holi melodies in vibrant color splashes.',
      hn: 'Rang-birange palon me doobe gramin, paramparik Bhojpuri Holi geeton par thirkte hue.'
    }
  }
];

function TimelineAchievements() {
  const { villageId, language } = useStore();
  const [timeline, setTimeline] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!villageId) return;
      setLoading(true);
      setError('');
      try {
        const [timeRes, achRes] = await Promise.all([
          axios.get(`/api/v1/villages/${villageId}/timeline`),
          axios.get(`/api/v1/villages/${villageId}/achievements`)
        ]);
        setTimeline(timeRes.data.data);
        setAchievements(achRes.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load timeline or achievements data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [villageId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIdx === null) return;
      if (e.key === 'Escape') {
        setSelectedImageIdx(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev + 1) % memoriesImages.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev - 1 + memoriesImages.length) % memoriesImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIdx]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '15px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(4,120,87,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading village history & achievement archives...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--primary)' }}>
          {language === 'hi' ? 'गांव का इतिहास और गौरवशाली उपलब्धि हॉल' : language === 'hn' ? 'Pateri History & Achievement Hall' : 'Pateri Heritage & Achievements'}
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Explore the milestones that shaped our village and celebrate the citizens who made Pateri proud.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        
        {/* Timeline Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Calendar size={24} color="var(--primary)" />
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Development Timeline</h2>
          </div>

          {timeline.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No timeline milestones recorded yet.</p>
          ) : (
            <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', paddingLeft: '20px', marginLeft: '10px' }}>
              {timeline.map((mile, idx) => (
                <div key={mile._id} style={{ position: 'relative', marginBottom: '30px' }}>
                  {/* Timeline bullet */}
                  <div style={{
                    position: 'absolute',
                    left: '-31px',
                    top: '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '4px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}></div>

                  <div className="glass-card" style={{ padding: '15px 20px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>{mile.year}</span>
                    <h3 style={{ margin: '5px 0 8px 0', fontSize: '1rem', fontWeight: '700' }}>{mile.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{mile.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Hall Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Award size={24} color="var(--secondary)" />
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Achievement Hall of Fame</h2>
          </div>

          {achievements.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No achievement certificates recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {achievements.map((ach) => (
                <div 
                  key={ach._id} 
                  className="glass-card" 
                  style={{ 
                    padding: '20px', 
                    borderTop: '4px solid var(--secondary)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ background: 'var(--bg-cream)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--secondary)' }}>
                      {ach.category}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{ach.year}</span>
                  </div>

                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.05rem', fontWeight: '750' }}>{ach.title}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ach.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '0.8rem' }}>
                    <User size={14} color="var(--primary)" />
                    <span style={{ color: 'var(--text-muted)' }}>Honoured Citizen:</span>
                    <strong style={{ color: 'var(--primary)' }}>{ach.residentId?.name || 'Pateri Panchayat'}</strong>
                    {ach.residentId?.occupation && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({ach.residentId.occupation})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Village Memories Gallery */}
      <div style={{ marginTop: '50px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
          <Image size={24} color="var(--primary)" />
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>
            {language === 'hi' ? 'ग्राम स्मृतियां और त्योहार (Holi 2026)' : language === 'hn' ? 'Village Memories & Festivals (Holi 2026)' : 'Village Memories & Festivals (Holi 2026)'}
          </h2>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '25px' }}>
          {language === 'hi' 
            ? 'पतेरी गाँव में होली और अन्य स्थानीय सांस्कृतिक उत्सवों की कुछ सुंदर यादें और तस्वीरें (HD Quality में देखने और डाउनलोड करने के लिए किसी भी फोटो पर क्लिक करें):'
            : language === 'hn'
            ? 'Pateri village me Holi aur baki local festivals ki yaadein (HD Quality me dekhne aur download karne ke liye photo par click karein):'
            : 'Explore memories of Holi and cultural festivals in Pateri (Click any photo to view in HD quality & download):'}
        </p>

        {/* Grid for photos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {memoriesImages.map((img, idx) => (
            <div 
              key={idx} 
              className="glass-card" 
              style={{ 
                padding: '12px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onClick={() => setSelectedImageIdx(idx)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image Container with Zoom Icon Overlay */}
              <div style={{ overflow: 'hidden', borderRadius: '8px', height: '200px', position: 'relative' }}>
                <img 
                  src={img.src} 
                  alt={img.title[language] || img.title['en']} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                
                {/* Visual Cue for HD expand on hover */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s ease',
                  borderRadius: '8px'
                }}
                className="image-overlay-hover"
                onMouseOver={(e) => { e.currentTarget.style.opacity = 1; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = 0; }}
                >
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    color: 'var(--primary)',
                    transform: 'scale(0.9)',
                    transition: 'transform 0.3s ease'
                  }}
                  className="zoom-icon-container"
                  >
                    <Maximize2 size={20} />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ padding: '4px 6px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '4px' }}>
                  {img.title[language] || img.title['en']}
                </strong>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {img.desc[language] || img.desc['en']}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal for HD view */}
      {selectedImageIdx !== null && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease',
            padding: '20px'
          }}
          onClick={() => setSelectedImageIdx(null)}
        >
          {/* Action buttons (Download & Close) */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '15px',
            zIndex: 10010
          }}>
            <a
              href={memoriesImages[selectedImageIdx].src}
              download={`holi_2026_${selectedImageIdx + 1}.jpg`}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onClick={(e) => e.stopPropagation()}
              title="Download HD Image"
            >
              <Download size={20} />
            </a>
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIdx(null);
              }}
              title="Close Gallery"
            >
              <X size={20} />
            </button>
          </div>

          {/* Left Arrow Navigation */}
          <button
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10010
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIdx((prev) => (prev - 1 + memoriesImages.length) % memoriesImages.length);
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image Container */}
          <div 
            style={{
              maxWidth: '85%',
              maxHeight: '75%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#000',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={memoriesImages[selectedImageIdx].src}
              alt={memoriesImages[selectedImageIdx].title[language] || memoriesImages[selectedImageIdx].title['en']}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
                animation: 'scaleUp 0.3s ease'
              }}
            />
          </div>

          {/* Right Arrow Navigation */}
          <button
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10010
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIdx((prev) => (prev + 1) % memoriesImages.length);
            }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Caption Overlay */}
          <div 
            style={{
              marginTop: '25px',
              color: '#fff',
              textAlign: 'center',
              maxWidth: '650px',
              padding: '0 20px',
              zIndex: 10010
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>
              {memoriesImages[selectedImageIdx].title[language] || memoriesImages[selectedImageIdx].title['en']}
            </h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
              {memoriesImages[selectedImageIdx].desc[language] || memoriesImages[selectedImageIdx].desc['en']}
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
              Photo {selectedImageIdx + 1} of {memoriesImages.length} • HD Quality Enabled
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineAchievements;
