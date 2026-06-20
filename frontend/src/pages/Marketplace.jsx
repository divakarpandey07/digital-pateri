import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { 
  Store, Milk, BookOpen, Wrench, ShieldAlert, Leaf, 
  Star, Search, Plus, X, MessageSquare, Phone, MapPin, 
  User, CheckCircle, Clock, ChevronDown, ChevronUp 
} from 'lucide-react';
import { translations } from '../utils/translations';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Category icon map helper
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case 'Grocery': return <Store className="icon-category" />;
    case 'Dairy': return <Milk className="icon-category" />;
    case 'Coaching': return <BookOpen className="icon-category" />;
    case 'Hardware': return <Wrench className="icon-category" />;
    case 'Medical': return <ShieldAlert className="icon-category" />;
    case 'Agriculture': return <Leaf className="icon-category" />;
    default: return <Store className="icon-category" />;
  }
};

function Marketplace() {
  const { user, villageId, language } = useStore();
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals & UI Toggles
  const [showRegModal, setShowRegModal] = useState(false);
  const [expandedReviewsId, setExpandedReviewsId] = useState(null);
  const [reviewsList, setReviewsList] = useState({});
  
  // Registration Form State
  const [newBiz, setNewBiz] = useState({
    businessName: '',
    category: '',
    contactMobile: '',
    address: '',
    latitude: 25.0210,
    longitude: 83.5684
  });
  
  // Review Form State
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get auth token helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('pateri_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch categories & businesses
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (villageId) {
      fetchBusinesses();
    }
  }, [villageId, selectedCategory, searchQuery, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/marketplace/categories`);
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
      const verifiedOnly = !isAdmin; // Admins can see pending/rejected too

      const res = await axios.get(`${API_BASE}/marketplace/businesses`, {
        params: {
          villageId,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          sort: sortBy === 'rating' ? 'rating' : (sortBy === 'name' ? 'name' : undefined),
          verifiedOnly,
          page,
          limit: 6
        }
      });
      setBusinesses(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch businesses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBusiness = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!newBiz.businessName || !newBiz.category || !newBiz.contactMobile) {
      setMessage({ type: 'danger', text: language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : language === 'hn' ? 'Saare required fields bharein.' : 'Please fill all required fields.' });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/marketplace/businesses`, {
        ...newBiz,
        villageId
      }, {
        headers: getAuthHeaders()
      });

      setMessage({ 
        type: 'success', 
        text: language === 'hi'
          ? 'दुकान सफलतापूर्वक पंजीकृत! सत्यापन स्थिति लंबित है।'
          : language === 'hn'
          ? 'Shop register ho gayi successfully! Verification status Pending approval hai.'
          : 'Shop registered successfully! Verification status is Pending approval.' 
      });
      setNewBiz({
        businessName: '',
        category: '',
        contactMobile: '',
        address: '',
        latitude: 25.0210,
        longitude: 83.5684
      });
      setTimeout(() => {
        setShowRegModal(false);
        setMessage({ type: '', text: '' });
        fetchBusinesses();
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || (language === 'hi' ? 'व्यवसाय पंजीकृत करने में विफल।' : language === 'hn' ? 'Business register karne me failure.' : 'Failed to register business.')
      });
    }
  };

  // Review management
  const fetchReviews = async (businessId) => {
    try {
      const res = await axios.get(`${API_BASE}/marketplace/businesses/${businessId}/reviews`);
      setReviewsList(prev => ({
        ...prev,
        [businessId]: res.data.data
      }));
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const toggleReviews = (businessId) => {
    if (expandedReviewsId === businessId) {
      setExpandedReviewsId(null);
    } else {
      setExpandedReviewsId(businessId);
      fetchReviews(businessId);
    }
  };

  const handlePostReview = async (e, businessId) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_BASE}/marketplace/businesses/${businessId}/reviews`, newReview, {
        headers: getAuthHeaders()
      });
      
      setMessage({ type: 'success', text: 'Review posted successfully!' });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(businessId);
      fetchBusinesses(); // Refresh rating cache display
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to post review. Double review lock active.'
      });
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0' }}>
      
      {/* Page Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 className="section-title">{translations[language]?.market_title || 'Pateri Local Marketplace'}</h1>
          <p className="section-subtitle">{translations[language]?.market_subtitle || 'Discover local shops, coaching institutes, and village artisans of Pateri'}</p>
        </div>
        {user ? (
          <button onClick={() => setShowRegModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> {language === 'hi' ? 'दुकान पंजीकृत करें' : language === 'hn' ? 'Register Shop' : 'Register Shop'}
          </button>
        ) : (
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{language === 'hi' ? 'अपना व्यवसाय पंजीकृत करने के लिए लॉग इन करें' : language === 'hn' ? 'Business register karne ke liye log in karein' : 'Log in to register your business'}</p>
        )}
      </div>

      {/* Categories Bar */}
      <div className="categories-filter-bar" style={{ display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
        <button 
          onClick={() => setSelectedCategory('')}
          className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
        >
          {language === 'hi' ? 'सभी श्रेणियां' : language === 'hn' ? 'All Categories' : 'All Categories'}
        </button>
        {categories.map((cat) => (
          <button 
            key={cat._id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`filter-chip ${selectedCategory === cat.name ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {getCategoryIcon(cat.name)}
            {language === 'hi' && cat.name === 'Grocery' ? 'किराना'
             : language === 'hi' && cat.name === 'Dairy' ? 'डेयरी'
             : language === 'hi' && cat.name === 'Coaching' ? 'कोचिंग'
             : language === 'hi' && cat.name === 'Hardware' ? 'हार्डवेयर'
             : language === 'hi' && cat.name === 'Medical' ? 'मेडिकल'
             : language === 'hi' && cat.name === 'Agriculture' ? 'कृषि'
             : cat.name}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 'var(--spacing-md)', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder={translations[language]?.market_search_placeholder || 'Search shops, services...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
        <div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
            <option value="-createdAt">{language === 'hi' ? 'नवीनतम पहले' : language === 'hn' ? 'Newest First' : 'Newest First'}</option>
            <option value="rating">{language === 'hi' ? 'सर्वोच्च दर्जा' : language === 'hn' ? 'Top Rated' : 'Top Rated'}</option>
            <option value="name">{language === 'hi' ? 'वर्णमाला के अनुसार' : language === 'hn' ? 'Alphabetical' : 'Alphabetical'}</option>
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--spacing-md)' }}>
          {message.text}
        </div>
      )}

      {/* Shop Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{language === 'hi' ? 'बाज़ार सूची लोड हो रही है...' : language === 'hn' ? 'Marketplace load ho raha hai...' : 'Loading marketplace directory...'}</div>
      ) : businesses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <p>{translations[language]?.market_no_shops || 'No stores or services found matching criteria.'}</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: 'var(--spacing-lg)' }}>
          {businesses.map((biz) => {
            const isOwner = user && user.id === biz.ownerId?._id;
            return (
              <div key={biz._id} className="card shop-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                
                {/* Pending Verification Banner */}
                {biz.verificationStatus === 'Pending' && (
                  <div className="badge-pending" style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--warning)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {language === 'hi' ? 'सत्यापन लंबित' : language === 'hn' ? 'Pending Verification' : 'Pending Verification'}
                  </div>
                )}

                {/* Card Title & Category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)' }}>
                    {getCategoryIcon(biz.category)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{biz.businessName}</h3>
                    <span className="badge-category" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                      {language === 'hi' && biz.category === 'Grocery' ? 'किराना'
                       : language === 'hi' && biz.category === 'Dairy' ? 'डेयरी'
                       : language === 'hi' && biz.category === 'Coaching' ? 'कोचिंग'
                       : language === 'hi' && biz.category === 'Hardware' ? 'हार्डवेयर'
                       : language === 'hi' && biz.category === 'Medical' ? 'मेडिकल'
                       : language === 'hi' && biz.category === 'Agriculture' ? 'कृषि'
                       : biz.category}
                    </span>
                  </div>
                </div>

                {/* Rating Cache Displays */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', color: 'var(--accent)' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.round(biz.averageRating) ? 'var(--accent)' : 'none'} 
                        stroke="var(--accent)"
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{biz.averageRating}</span>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>({biz.totalReviews} {language === 'hi' ? 'समीक्षाएं' : 'reviews'})</span>
                </div>

                {/* Details list */}
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} className="text-muted" />
                    <span>+91 {biz.contactMobile}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={14} className="text-muted" style={{ marginTop: '3px' }} />
                    <span>{biz.address || (language === 'hi' ? 'पतेरी ग्राम केंद्र' : language === 'hn' ? 'Pateri Village Center' : 'Pateri Village Center')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} className="text-muted" />
                    <span style={{ fontSize: '0.8rem' }}>{language === 'hi' ? 'पंजीकृतकर्ता' : language === 'hn' ? 'Registered by' : 'Registered by'} {biz.ownerId?.email}</span>
                  </div>
                </div>

                <hr style={{ margin: 'var(--spacing-md) 0' }} />

                {/* Reviews Drawer trigger button */}
                <button 
                  onClick={() => toggleReviews(biz._id)}
                  className="btn-secondary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={16} /> 
                  {expandedReviewsId === biz._id 
                    ? (language === 'hi' ? 'समीक्षाएं छिपाएं' : language === 'hn' ? 'Hide Reviews' : 'Hide Reviews') 
                    : (language === 'hi' ? 'समीक्षाएं देखें' : language === 'hn' ? 'View Reviews' : 'View Reviews')}
                  {expandedReviewsId === biz._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Collapsible reviews container */}
                {expandedReviewsId === biz._id && (
                  <div style={{ marginTop: 'var(--spacing-md)', background: 'var(--bg-cream)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', maxOpacity: '500px', overflowY: 'auto' }}>
                    <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>{language === 'hi' ? 'ग्राहक समीक्षाएं' : language === 'hn' ? 'Customer Reviews' : 'Customer Reviews'}</h4>
                    
                    {/* Reviews List */}
                    {(!reviewsList[biz._id] || reviewsList[biz._id].length === 0) ? (
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>{language === 'hi' ? 'अभी तक कोई समीक्षा नहीं। समीक्षा करने वाले पहले व्यक्ति बनें!' : language === 'hn' ? 'Koi reviews nahi hai abhi tak. Pehla review aap likhein!' : 'No reviews yet. Be the first to review!'}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        {reviewsList[biz._id].map(rev => (
                          <div key={rev._id} style={{ background: 'white', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{rev.userId?.email?.split('@')[0]}</span>
                              <div style={{ display: 'flex' }}>
                                {[...Array(rev.rating)].map((_, rIdx) => (
                                  <Star key={rIdx} size={12} fill="var(--accent)" stroke="var(--accent)" />
                                ))}
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write a Review block */}
                    {user && !isOwner && (
                      <form onSubmit={(e) => handlePostReview(e, biz._id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>{language === 'hi' ? 'रेटिंग:' : 'Rating:'}</label>
                          <select 
                            value={newReview.rating} 
                            onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                            style={{ padding: '4px', fontSize: '0.85rem' }}
                          >
                            <option value="5">5 {language === 'hi' ? 'सितारे' : 'Stars'}</option>
                            <option value="4">4 {language === 'hi' ? 'सितारे' : 'Stars'}</option>
                            <option value="3">3 {language === 'hi' ? 'सितारे' : 'Stars'}</option>
                            <option value="2">2 {language === 'hi' ? 'सितारे' : 'Stars'}</option>
                            <option value="1">1 {language === 'hi' ? 'सितारे' : 'Stars'}</option>
                          </select>
                        </div>
                        <textarea 
                          placeholder={language === 'hi' ? 'प्रतिक्रिया लिखें...' : language === 'hn' ? 'Feedback likhein...' : 'Write feedback...'}
                          rows="2"
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          style={{ padding: '6px', fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '6px', fontSize: '0.85rem' }}>{language === 'hi' ? 'समीक्षा जमा करें' : language === 'hn' ? 'Submit Review' : 'Submit Review'}</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'var(--spacing-lg)' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary">
            {language === 'hi' ? 'पिछला' : language === 'hn' ? 'Prev' : 'Prev'}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            {language === 'hi' ? `पृष्ठ ${page} का ${totalPages}` : language === 'hn' ? `Page ${page} of ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary">
            {language === 'hi' ? 'अगला' : language === 'hn' ? 'Next' : 'Next'}
          </button>
        </div>
      )}

      {/* Register Business Modal */}
      {showRegModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card modal-content" style={{ width: '450px', position: 'relative', padding: 'var(--spacing-lg)' }}>
            <button 
              onClick={() => setShowRegModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
              {language === 'hi' ? 'नया व्यवसाय पंजीकृत करें' : language === 'hn' ? 'Register New Business' : 'Register New Business'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
              {language === 'hi' ? 'पंचायत व्यवस्थापक सत्यापन अनुमोदन के लिए विवरण जमा करें' : language === 'hn' ? 'Details submit karein Panchayat Admin verification approval ke liye' : 'Submit details for Panchayat Admin verification approval'}
            </p>
            
            <form onSubmit={handleRegisterBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'व्यवसाय का नाम *' : language === 'hn' ? 'Business Name *' : 'Business Name *'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Verma General Store"
                  value={newBiz.businessName}
                  onChange={(e) => setNewBiz(prev => ({ ...prev, businessName: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'श्रेणी *' : language === 'hn' ? 'Category *' : 'Category *'}
                </label>
                <select 
                  required
                  value={newBiz.category}
                  onChange={(e) => setNewBiz(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">{language === 'hi' ? 'श्रेणी का चयन करें' : language === 'hn' ? 'Select Category' : 'Select Category'}</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>
                      {language === 'hi' && cat.name === 'Grocery' ? 'किराना'
                       : language === 'hi' && cat.name === 'Dairy' ? 'डेयरी'
                       : language === 'hi' && cat.name === 'Coaching' ? 'कोचिंग'
                       : language === 'hi' && cat.name === 'Hardware' ? 'हार्डवेयर'
                       : language === 'hi' && cat.name === 'Medical' ? 'मेडिकल'
                       : language === 'hi' && cat.name === 'Agriculture' ? 'कृषि'
                       : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'संपर्क मोबाइल *' : language === 'hn' ? 'Contact Mobile *' : 'Contact Mobile *'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="10-digit number"
                  value={newBiz.contactMobile}
                  onChange={(e) => setNewBiz(prev => ({ ...prev, contactMobile: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                  {language === 'hi' ? 'पता' : language === 'hn' ? 'Address' : 'Address'}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Purab Tola, Near Panchayat Bhawan"
                  value={newBiz.address}
                  onChange={(e) => setNewBiz(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'अक्षांश (OSM Map)' : 'Latitude (OSM Map)'}</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={newBiz.latitude}
                    onChange={(e) => setNewBiz(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'देशांतर (OSM Map)' : 'Longitude (OSM Map)'}</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={newBiz.longitude}
                    onChange={(e) => setNewBiz(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {language === 'hi' ? 'अनुरोध जमा करें' : language === 'hn' ? 'Submit Request' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Marketplace;
