import React from 'react';
import { useStore } from '../store/useStore';
import { FileText, Download, Landmark, Image, Map, Compass } from 'lucide-react';

const ARCHIVE_ITEMS = [
  {
    id: 'arch-001',
    title: 'Pateri Village Land Registry Map (1974)',
    category: 'Historical Maps',
    description: 'First official hand-drawn cadastral map of Pateri revenue villages showing original field boundaries.',
    size: '4.2 MB',
    fileType: 'PDF / JPEG',
    icon: Map
  },
  {
    id: 'arch-002',
    title: 'Gram Panchayat Inception Charter (1955)',
    category: 'Official Records',
    description: 'Bilingual historical resolution document officially incorporating Pateri Gram Panchayat under Bihar Panchayat Raj Act.',
    size: '1.8 MB',
    fileType: 'PDF',
    icon: Landmark
  },
  {
    id: 'arch-003',
    title: 'Kaimur Hill Folk Songs & Bhojpuri Culture Guide',
    category: 'Cultural Heritage',
    description: 'Anthology of traditional folk songs, rituals, and seasonal agricultural celebrations compiled by village elders.',
    size: '2.5 MB',
    fileType: 'EPUB / PDF',
    icon: Compass
  },
  {
    id: 'arch-004',
    title: 'Pateri High School Foundation Roster (1988)',
    category: 'Education History',
    description: 'List of original founding donors, local teachers, and students enrolled in the school first session.',
    size: '950 KB',
    fileType: 'PDF',
    icon: FileText
  }
];

function DigitalArchive() {
  const { language } = useStore();

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: '0 0 10px 0', color: 'var(--primary)' }}>
          {language === 'hi' ? 'डिजिटल ग्राम अभिलेखागार' : language === 'hn' ? 'Digital Village Archive' : 'Pateri Digital Archive'}
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Preserving Pateri’s historical maps, ancient land records, cultural heritage assets, and old documentation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
        {ARCHIVE_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="glass-card" 
              style={{ 
                padding: '25px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                border: '1.5px solid var(--border)'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'rgba(4,120,87,0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--bg-cream)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '12px' }}>
                    {item.category}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '750' }}>{item.title}</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>
                  Format: <strong>{item.fileType}</strong> ({item.size})
                </div>
                <button 
                  onClick={() => alert(`Downloading ${item.title}...`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default DigitalArchive;
