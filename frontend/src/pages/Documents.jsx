import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { 
  Folder, File, Download, Search, Plus, X, 
  Lock, Unlock, Eye, Calendar, Trash2 
} from 'lucide-react';
import { translations } from '../utils/translations';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Category color maps helper
const getCategoryColor = (cat) => {
  switch (cat) {
    case 'Government Schemes': return '#2563eb'; // Blue
    case 'Scholarships': return '#7c3aed'; // Purple
    case 'Forms': return '#059669'; // Emerald
    case 'Certificates': return '#0891b2'; // Cyan
    case 'Panchayat Notices': return '#d97706'; // Saffron
    case 'Agriculture Guides': return '#16a34a'; // Green
    case 'Education Resources': return '#db2777'; // Pink
    default: return 'var(--text-muted)';
  }
};

function Documents() {
  const { user, villageId, language } = useStore();
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Document Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Government Schemes',
    fileUrl: '',
    visibility: 'Public',
    expiresAt: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('pateri_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (villageId) {
      fetchDocuments();
    }
  }, [villageId, selectedCategory, searchQuery]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/documents`, {
        params: {
          villageId,
          category: selectedCategory || undefined
        },
        headers: getAuthHeaders()
      });

      // Local filter by search query if any
      let data = res.data.data;
      if (searchQuery) {
        data = data.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!uploadForm.title || !uploadForm.fileUrl) {
      setMessage({ type: 'danger', text: 'Please fill all required fields.' });
      return;
    }

    try {
      await axios.post(`${API_BASE}/documents`, {
        ...uploadForm,
        villageId,
        expiresAt: uploadForm.expiresAt || undefined
      }, {
        headers: getAuthHeaders()
      });

      setMessage({ type: 'success', text: 'Document uploaded successfully to the vault!' });
      setUploadForm({
        title: '',
        category: 'Government Schemes',
        fileUrl: '',
        visibility: 'Public',
        expiresAt: ''
      });
      setTimeout(() => {
        setShowUploadModal(false);
        setMessage({ type: '', text: '' });
        fetchDocuments();
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Upload failed.'
      });
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from the vault?')) return;
    setMessage({ type: '', text: '' });

    try {
      await axios.delete(`${API_BASE}/documents/${docId}`, {
        headers: getAuthHeaders()
      });
      setMessage({ type: 'success', text: 'Document deleted successfully.' });
      fetchDocuments();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Delete failed.'
      });
    }
  };

  const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
  const categoriesList = [
    'Government Schemes', 
    'Scholarships', 
    'Forms', 
    'Certificates', 
    'Panchayat Notices', 
    'Agriculture Guides', 
    'Education Resources'
  ];

  const getTranslatedCategory = (cat) => {
    if (language === 'hi') {
      if (cat === 'Government Schemes') return 'सरकारी योजनाएं';
      if (cat === 'Scholarships') return 'छात्रवृत्ति';
      if (cat === 'Forms') return 'फॉर्म';
      if (cat === 'Certificates') return 'प्रमाण पत्र';
      if (cat === 'Panchayat Notices') return 'पंचायत सूचना';
      if (cat === 'Agriculture Guides') return 'कृषि मार्गदर्शिका';
      if (cat === 'Education Resources') return 'शिक्षा संसाधन';
    } else if (language === 'hn') {
      if (cat === 'Government Schemes') return 'Sarkari Schemes';
      if (cat === 'Scholarships') return 'Scholarships';
      if (cat === 'Forms') return 'Forms';
      if (cat === 'Certificates') return 'Certificates';
      if (cat === 'Panchayat Notices') return 'Panchayat Notices';
      if (cat === 'Agriculture Guides') return 'Kheti Guides';
      if (cat === 'Education Resources') return 'Padhai Resources';
    }
    return cat;
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0' }}>
      
      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 className="section-title">{translations[language]?.doc_title || 'Pateri Document Vault'}</h1>
          <p className="section-subtitle">{translations[language]?.doc_subtitle || 'Access important government schemes, certificates, scholarship forms, and crop manuals'}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> {language === 'hi' ? 'दस्तावेज़ अपलोड करें' : language === 'hn' ? 'Document Upload' : 'Upload Document'}
          </button>
        )}
      </div>

      {/* Categories Grid (Folders) */}
      <div className="grid-4" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <button 
          onClick={() => setSelectedCategory('')}
          className={`card folder-btn ${selectedCategory === '' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: 'var(--spacing-md)', border: selectedCategory === '' ? '2px solid var(--primary)' : '1px solid var(--border)', background: 'var(--bg-white)', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-md)' }}
        >
          <Folder size={32} style={{ color: 'var(--accent)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{language === 'hi' ? 'सभी दस्तावेज़' : language === 'hn' ? 'All Documents' : 'All Documents'}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'मुख्य रिपॉजिटरी' : language === 'hn' ? 'Main Repository' : 'Main Repository'}</span>
          </div>
        </button>

        {categoriesList.map((cat, idx) => (
          <button 
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`card folder-btn ${selectedCategory === cat ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: 'var(--spacing-md)', border: selectedCategory === cat ? '2px solid var(--primary)' : '1px solid var(--border)', background: 'var(--bg-white)', cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius-md)' }}
          >
            <Folder size={32} style={{ color: getCategoryColor(cat) }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{getTranslatedCategory(cat)}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'फ़ोल्डर' : 'Folder'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search and Feedback alerts */}
      <div className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder={translations[language]?.doc_search || 'Search documents by title...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--spacing-md)' }}>
          {message.text}
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{language === 'hi' ? 'दस्तावेज़ निर्देशिका लोड हो रही है...' : language === 'hn' ? 'Documents load ho rahe hain...' : 'Loading document directories...'}</div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{translations[language]?.doc_no_docs || 'No documents found matching the search.'}</div>
      ) : (
        <div className="grid-3" style={{ gap: 'var(--spacing-lg)' }}>
          {documents.map((doc) => {
            const token = localStorage.getItem('pateri_token') || '';
            const downloadUrl = `${API_BASE}/documents/${doc._id}/download?token=${encodeURIComponent(token)}`;
            
            return (
              <div key={doc._id} className="card document-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: `4px solid ${getCategoryColor(doc.category)}` }}>
                
                {/* Header title */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ padding: '8px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)' }}>
                    <File size={24} style={{ color: getCategoryColor(doc.category) }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{doc.title}</h3>
                    <span className="badge" style={{ background: '#f3f4f6', color: 'var(--text-dark)', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{getTranslatedCategory(doc.category)}</span>
                    
                    {/* Visibility badge */}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      color: doc.visibility === 'Public' ? 'var(--success)' : (doc.visibility === 'Residents Only' ? '#2563eb' : 'var(--danger)') 
                    }}>
                      {doc.visibility === 'Public' ? (language === 'hi' ? 'सार्वजनिक' : 'Public') : 
                       (doc.visibility === 'Residents Only' ? (language === 'hi' ? 'केवल निवासी' : language === 'hn' ? 'Residents Only' : 'Residents Only') : 
                       (language === 'hi' ? 'केवल एडमिन' : language === 'hn' ? 'Admins Only' : 'Admins Only'))}
                    </span>
                  </div>
                </div>

                <hr style={{ margin: 'var(--spacing-md) 0' }} />

                {/* Footer details & single-click redirect experiences */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{language === 'hi' ? 'डाउनलोड:' : 'Downloads:'} <strong style={{ color: 'var(--text-dark)' }}>{doc.downloadCount}</strong></span>
                    {doc.expiresAt && <span>{language === 'hi' ? 'समाप्ति:' : 'Expires:'} {new Date(doc.expiresAt).toLocaleDateString()}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteDocument(doc._id)} 
                        className="btn-secondary"
                        style={{ padding: '6px', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    {/* Single click redirect tracking anchor */}
                    <a 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-primary" 
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      <Download size={14} /> {translations[language]?.btn_download || 'Download'}
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card modal-content" style={{ width: '450px', position: 'relative', padding: 'var(--spacing-lg)' }}>
            <button 
              onClick={() => setShowUploadModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>{language === 'hi' ? 'दस्तावेज़ अपलोड करें' : language === 'hn' ? 'Document Upload' : 'Upload Document'}</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>{language === 'hi' ? 'पतेरी दस्तावेज़ वॉल्ट निर्देशिका में नई फ़ाइल जोड़ें' : language === 'hn' ? 'Pateri Vault directories me nayi file add karein' : 'Add new file record to Pateri Vault directories'}</p>
            
            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{language === 'hi' ? 'दस्तावेज़ शीर्षक *' : language === 'hn' ? 'Document Title *' : 'Document Title *'}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Organic Rice Seed Subsidy Form"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{language === 'hi' ? 'श्रेणी *' : language === 'hn' ? 'Category *' : 'Category *'}</label>
                <select 
                  required
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{getTranslatedCategory(cat)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{language === 'hi' ? 'फ़ाइल URL या पाथ *' : language === 'hn' ? 'File URL or Path *' : 'File URL or Path *'}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. https://krishi.bih.nic.in/manual.pdf"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{language === 'hi' ? 'दृश्यता अनुमति' : language === 'hn' ? 'Visibility Permission' : 'Visibility Permissions'}</label>
                <select 
                  value={uploadForm.visibility}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, visibility: e.target.value }))}
                >
                  <option value="Public">{language === 'hi' ? 'सार्वजनिक (कोई भी देख/डाउनलोड कर सकता है)' : language === 'hn' ? 'Public (Koi bhi dekh/download kar sakta hai)' : 'Public (Anyone can view/download)'}</option>
                  <option value="Residents Only">{language === 'hi' ? 'केवल निवासी (लॉग इन निवासी)' : language === 'hn' ? 'Residents Only (Logged in residents)' : 'Residents Only (Logged in residents)'}</option>
                  <option value="Admins Only">{language === 'hi' ? 'केवल एडमिन (पंचायात / सुपर एडमिन)' : language === 'hn' ? 'Admins Only (Panchayat / Super Admin)' : 'Admins Only (Panchayat / Super Admin)'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{language === 'hi' ? 'समाप्ति तिथि (वैकल्पिक)' : language === 'hn' ? 'Expiry Date (Optional)' : 'Expiry Date (Optional)'}</label>
                <input 
                  type="date" 
                  value={uploadForm.expiresAt}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>{language === 'hi' ? 'वॉल्ट में जोड़ें' : language === 'hn' ? 'Vault me add karein' : 'Add to Vault'}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Documents;
