import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { 
  Settings, Plus, Users, Heart, AlertTriangle, 
  CheckCircle, RefreshCw, Send, ShieldCheck, 
  Store, Award, FileText, Check, X, BarChart3
} from 'lucide-react';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, Title, 
  PointElement, LineElement 
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, Title, PointElement, LineElement
);

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const adminTranslations = {
  en: {
    title: "Panchayat Administration",
    tab_analytics: "Analytics Dashboard",
    tab_complaints: "Complaints Roster",
    tab_shop_approval: "Shop Approval",
    tab_publish: "Publish Notice/Jobs",
    kpi_residents: "Residents",
    kpi_res_rate: "Resolution Rate",
    kpi_shops: "Local Shops",
    kpi_volunteers: "Active Volunteers",
    kpi_donors: "Donors Active",
    kpi_downloads: "Vault Downloads",
    chart_comp_cat: "Complaints by Category",
    chart_comp_status: "Complaints Resolution Status",
    chart_biz_cat: "Business Categories Distribution",
    chart_vol_cat: "Volunteers by Service Area",
    recent_complaints: "Recent Village Complaints",
    recent_volunteer: "Recent Volunteer Tickets",
    comp_roster_title: "Complaints Roster",
    th_category: "Category",
    th_title: "Title",
    th_mohalla: "Mohalla",
    th_priority: "Priority",
    th_status: "Status",
    th_action: "Action",
    btn_update_status: "Update Status",
    pending_biz_title: "Pending Business Registrations",
    no_pending_biz: "No pending business approvals.",
    lbl_category: "Category",
    lbl_contact: "Contact",
    lbl_address: "Address",
    btn_approve: "Approve",
    btn_reject: "Reject",
    publish_notice_title: "Publish Panchayat Notice",
    publish_job_title: "Publish Job Opportunity",
    lbl_title: "Title *",
    lbl_content: "Content *",
    lbl_priority: "Priority",
    opt_normal: "Normal",
    opt_high: "High Priority",
    btn_publish_notice: "Publish Notice",
    lbl_job_title: "Job Title *",
    lbl_type: "Type *",
    lbl_salary: "Salary Details",
    lbl_desc: "Description *",
    btn_publish_job: "Publish Job",
    modal_title: "Update Complaint Status",
    modal_ticket: "Ticket",
    modal_select_status: "Select Status",
    modal_comment: "Comment *",
    btn_update: "Update",
    btn_cancel: "Cancel",
    compiling_metrics: "Compiling dashboard metrics...",
    job_types: {
      Teaching: "Teaching",
      Farming: "Farming",
      "Shop Work": "Shop Work",
      "Skilled Labor": "Skilled Labor",
      Other: "Other"
    },
    notice_success: "Notice board updated successfully!",
    job_success: "Job opening published successfully!",
    shop_verified: "Shop has been successfully Approved!",
    shop_rejected: "Shop has been successfully Rejected!",
    action_failed: "Action failed.",
    status_pending: "Pending",
    status_in_progress: "In Progress",
    status_resolved: "Resolved"
  },
  hi: {
    title: "पंचायत प्रशासन",
    tab_analytics: "विश्लेषण डैशबोर्ड",
    tab_complaints: "शिकायत सूची",
    tab_shop_approval: "दुकान स्वीकृति",
    tab_publish: "घोषणा/नौकरी पोस्ट करें",
    kpi_residents: "नागरिक",
    kpi_res_rate: "समाधान दर",
    kpi_shops: "स्थानीय दुकानें",
    kpi_volunteers: "सक्रिय स्वयंसेवक",
    kpi_donors: "सक्रिय रक्तदाता",
    kpi_downloads: "वॉल्ट डाउनलोड",
    chart_comp_cat: "श्रेणी के अनुसार शिकायतें",
    chart_comp_status: "शिकायत निवारण स्थिति",
    chart_biz_cat: "व्यापार श्रेणियों का वितरण",
    chart_vol_cat: "सेवा क्षेत्र के अनुसार स्वयंसेवक",
    recent_complaints: "हालिया गाँव की शिकायतें",
    recent_volunteer: "हालिया स्वयंसेवक टिकट",
    comp_roster_title: "शिकायत सूची",
    th_category: "श्रेणी",
    th_title: "शीर्षक",
    th_mohalla: "मोहल्ला",
    th_priority: "प्राथमिकता",
    th_status: "स्थिति",
    th_action: "कार्रवाई",
    btn_update_status: "स्थिति बदलें",
    pending_biz_title: "लंबित व्यवसाय पंजीकरण",
    no_pending_biz: "कोई लंबित व्यवसाय स्वीकृति नहीं है।",
    lbl_category: "श्रेणी",
    lbl_contact: "संपर्क",
    lbl_address: "पता",
    btn_approve: "स्वीकृत करें",
    btn_reject: "अस्वीकृत करें",
    publish_notice_title: "पंचायत सूचना जारी करें",
    publish_job_title: "रोजगार का अवसर पोस्ट करें",
    lbl_title: "शीर्षक *",
    lbl_content: "सामग्री *",
    lbl_priority: "प्राथमिकता",
    opt_normal: "सामान्य",
    opt_high: "उच्च प्राथमिकता",
    btn_publish_notice: "सूचना जारी करें",
    lbl_job_title: "नौकरी का शीर्षक *",
    lbl_type: "प्रकार *",
    lbl_salary: "वेतन विवरण",
    lbl_desc: "विवरण *",
    btn_publish_job: "नौकरी पोस्ट करें",
    modal_title: "शिकायत की स्थिति अपडेट करें",
    modal_ticket: "टिकट",
    modal_select_status: "स्थिति चुनें",
    modal_comment: "टिप्पणी *",
    btn_update: "अपडेट करें",
    btn_cancel: "रद्द करें",
    compiling_metrics: "डैशबोर्ड मेट्रिक्स संकलित किए जा रहे हैं...",
    job_types: {
      Teaching: "शिक्षण",
      Farming: "खेती",
      "Shop Work": "दुकान का काम",
      "Skilled Labor": "कुशल श्रमिक",
      Other: "अन्य"
    },
    notice_success: "सूचना बोर्ड सफलतापूर्वक अपडेट किया गया!",
    job_success: "नौकरी का अवसर सफलतापूर्वक जारी किया गया!",
    shop_verified: "दुकान को सफलतापूर्वक स्वीकृत कर दिया गया है!",
    shop_rejected: "दुकान को सफलतापूर्वक अस्वीकृत कर दिया गया है!",
    action_failed: "कार्रवाई विफल रही।",
    status_pending: "लंबित",
    status_in_progress: "प्रगति पर",
    status_resolved: "समाधान हुआ"
  },
  hn: {
    title: "Panchayat Administration",
    tab_analytics: "Analytics Dashboard",
    tab_complaints: "Complaints Roster",
    tab_shop_approval: "Shop Approval",
    tab_publish: "Publish Notice/Jobs",
    kpi_residents: "Residents",
    kpi_res_rate: "Resolution Rate",
    kpi_shops: "Local Shops",
    kpi_volunteers: "Active Volunteers",
    kpi_donors: "Donors Active",
    kpi_downloads: "Vault Downloads",
    chart_comp_cat: "Complaints by Category",
    chart_comp_status: "Complaints Resolution Status",
    chart_biz_cat: "Business Categories Distribution",
    chart_vol_cat: "Volunteers by Service Area",
    recent_complaints: "Recent Village Complaints",
    recent_volunteer: "Recent Volunteer Tickets",
    comp_roster_title: "Complaints Roster",
    th_category: "Category",
    th_title: "Title",
    th_mohalla: "Mohalla",
    th_priority: "Priority",
    th_status: "Status",
    th_action: "Action",
    btn_update_status: "Status Update karein",
    pending_biz_title: "Pending Business Registrations",
    no_pending_biz: "Koi pending business approval nahi hai.",
    lbl_category: "Category",
    lbl_contact: "Contact",
    lbl_address: "Pata",
    btn_approve: "Approve",
    btn_reject: "Reject",
    publish_notice_title: "Panchayat Notice Publish karein",
    publish_job_title: "Job Opportunity Publish karein",
    lbl_title: "Title *",
    lbl_content: "Content *",
    lbl_priority: "Priority",
    opt_normal: "Normal",
    opt_high: "High Priority",
    btn_publish_notice: "Notice Publish karein",
    lbl_job_title: "Job Title *",
    lbl_type: "Type *",
    lbl_salary: "Salary Details",
    lbl_desc: "Description *",
    btn_publish_job: "Job Publish karein",
    modal_title: "Complaint Status Update karein",
    modal_ticket: "Ticket",
    modal_select_status: "Status Select karein",
    modal_comment: "Comment *",
    btn_update: "Update",
    btn_cancel: "Cancel",
    compiling_metrics: "Dashboard metrics load ho rahe hain...",
    job_types: {
      Teaching: "Teaching",
      Farming: "Farming",
      "Shop Work": "Shop Work",
      "Skilled Labor": "Skilled Labor",
      Other: "Other"
    },
    notice_success: "Notice board successfully update ho gaya!",
    job_success: "Job opening successfully publish ho gayi!",
    shop_verified: "Shop successfully Approve ho gayi hai!",
    shop_rejected: "Shop successfully Reject ho gayi hai!",
    action_failed: "Action fail ho gaya.",
    status_pending: "Pending",
    status_in_progress: "In Progress",
    status_resolved: "Resolved"
  }
};

function Admin() {
  const { 
    complaints, fetchComplaints, updateComplaintStatus, 
    createNotice, createJob, fetchVillageDetails, villageId,
    language 
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'complaints' | 'shops' | 'publish'
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Update Status Form
  const [updatingComplaint, setUpdatingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [statusComment, setStatusComment] = useState('');
  
  // Notice Form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState('Normal');

  // Job Form
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Teaching');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSalary, setJobSalary] = useState('');

  const t = adminTranslations[language] || adminTranslations['en'];

  const translateCategory = (cat) => {
    if (!cat) return '';
    if (language === 'hi') {
      const map = {
        'Road': 'सड़क',
        'Water': 'पानी',
        'Electricity': 'बिजली',
        'Sanitation': 'स्वच्छता',
        'Drainage': 'निकासी',
        'Internet': 'इंटरनेट',
        'Health': 'स्वास्थ्य',
        'Agriculture': 'कृषि',
        'Education': 'शिक्षा',
        'Environment': 'पर्यावरण',
        'Security': 'सुरक्षा',
        'Other': 'अन्य'
      };
      return map[cat] || cat;
    }
    if (language === 'hn') {
      const map = {
        'Road': 'Road',
        'Water': 'Paani',
        'Electricity': 'Bijli',
        'Sanitation': 'Safai',
        'Drainage': 'Nikaasi',
        'Internet': 'Internet',
        'Health': 'Health',
        'Agriculture': 'Krishi',
        'Education': 'Education',
        'Environment': 'Environment',
        'Security': 'Security',
        'Other': 'Other'
      };
      return map[cat] || cat;
    }
    return cat;
  };

  const translateMohalla = (mohalla) => {
    if (!mohalla) return language === 'hi' ? 'सामान्य' : 'General';
    if (mohalla === 'General') return language === 'hi' ? 'सामान्य' : 'General';
    return mohalla;
  };

  const translatePriority = (priority) => {
    if (!priority) return '';
    if (language === 'hi') {
      const map = {
        'Low': 'कम',
        'Medium': 'मध्यम',
        'High': 'उच्च',
        'Emergency': 'आपातकालीन'
      };
      return map[priority] || priority;
    }
    if (language === 'hn') {
      const map = {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High',
        'Emergency': 'Emergency'
      };
      return map[priority] || priority;
    }
    return priority;
  };

  const translateStatus = (status) => {
    if (!status) return '';
    if (language === 'hi') {
      const map = {
        'Pending': 'लंबित',
        'In Progress': 'प्रगति पर',
        'Resolved': 'समाधान हुआ'
      };
      return map[status] || status;
    }
    if (language === 'hn') {
      const map = {
        'Pending': 'Pending',
        'In Progress': 'In Progress',
        'Resolved': 'Resolved'
      };
      return map[status] || status;
    }
    return status;
  };

  // Get auth headers helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('pateri_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all admin data on mount / tab change
  useEffect(() => {
    fetchDashboardData();
    fetchComplaints();
    fetchPendingBusinesses();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      setDashboardData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBusinesses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/marketplace/businesses`, {
        params: {
          villageId,
          verifiedOnly: false,
          verificationStatus: 'Pending'
        },
        headers: getAuthHeaders()
      });
      setPendingBusinesses(res.data.data.records);
    } catch (err) {
      console.error('Failed to fetch pending businesses', err);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updatingComplaint) return;

    const success = await updateComplaintStatus(updatingComplaint._id, newStatus, statusComment);
    if (success) {
      setUpdatingComplaint(null);
      setStatusComment('');
      fetchDashboardData();
      fetchComplaints();
    }
  };

  const handleVerifyBusiness = async (bizId, status) => {
    setMessage({ type: '', text: '' });
    try {
      await axios.patch(`${API_BASE}/marketplace/businesses/${bizId}/verify`, {
        status
      }, {
        headers: getAuthHeaders()
      });

      setMessage({ type: 'success', text: status === 'Verified' ? t.shop_verified : t.shop_rejected });
      fetchPendingBusinesses();
      fetchDashboardData();
    } catch (err) {
      setMessage({ type: 'danger', text: t.action_failed });
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const success = await createNotice({
      title: noticeTitle,
      content: noticeContent,
      priority: noticePriority
    });

    if (success) {
      setNoticeTitle('');
      setNoticeContent('');
      alert(t.notice_success);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc) return;

    const success = await createJob({
      title: jobTitle,
      type: jobType,
      description: jobDesc,
      salary: jobSalary
    });

    if (success) {
      setJobTitle('');
      setJobDesc('');
      setJobSalary('');
      alert(t.job_success);
    }
  };

  // CHART DATA COMPILATION
  const getComplaintsCategoryChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const chartSrc = dashboardData.complaints?.complaintsByCategory || [];
    return {
      labels: chartSrc.map(d => translateCategory(d?.name)),
      datasets: [
        {
          label: language === 'hi' ? 'शिकायतें' : language === 'hn' ? 'Complaints' : 'Complaints',
          data: chartSrc.map(d => d?.value || 0),
          backgroundColor: '#047857',
          borderRadius: 6
        }
      ]
    };
  };

  const getComplaintsStatusChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const chartSrc = dashboardData.complaints?.complaintsByStatus || [];
    return {
      labels: chartSrc.map(d => translateStatus(d?.name)),
      datasets: [
        {
          data: chartSrc.map(d => d?.value || 0),
          backgroundColor: ['#ca8a04', '#3b82f6', '#16a34a']
        }
      ]
    };
  };

  const getBusinessCategoryChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const chartSrc = dashboardData.demographics?.businessesByCategory || [];
    return {
      labels: chartSrc.map(d => translateCategory(d?.name)),
      datasets: [
        {
          label: language === 'hi' ? 'व्यवसाय' : language === 'hn' ? 'Businesses' : 'Businesses',
          data: chartSrc.map(d => d?.value || 0),
          backgroundColor: '#d97706',
          borderRadius: 6
        }
      ]
    };
  };

  const getVolunteerCategoryChartData = () => {
    if (!dashboardData) return { labels: [], datasets: [] };
    const chartSrc = dashboardData.demographics?.volunteersByCategory || [];
    return {
      labels: chartSrc.map(d => translateCategory(d?.name)),
      datasets: [
        {
          data: chartSrc.map(d => d?.value || 0),
          backgroundColor: ['#3b82f6', '#ec4899', '#ef4444', '#dc2626', '#10b981']
        }
      ]
    };
  };

  const kpis = dashboardData?.kpis || {};

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={28} color="var(--primary)" />
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{t.title}</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('dashboard')} className="btn-secondary" style={{ background: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--border)', color: activeTab === 'dashboard' ? 'white' : 'var(--text-dark)', padding: '6px 15px', fontSize: '0.85rem' }}>
            {t.tab_analytics}
          </button>
          <button onClick={() => setActiveTab('complaints')} className="btn-secondary" style={{ background: activeTab === 'complaints' ? 'var(--primary)' : 'var(--border)', color: activeTab === 'complaints' ? 'white' : 'var(--text-dark)', padding: '6px 15px', fontSize: '0.85rem' }}>
            {t.tab_complaints}
          </button>
          <button onClick={() => setActiveTab('shops')} className="btn-secondary" style={{ background: activeTab === 'shops' ? 'var(--primary)' : 'var(--border)', color: activeTab === 'shops' ? 'white' : 'var(--text-dark)', padding: '6px 15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t.tab_shop_approval} ({pendingBusinesses.length})
          </button>
          <button onClick={() => setActiveTab('publish')} className="btn-secondary" style={{ background: activeTab === 'publish' ? 'var(--primary)' : 'var(--border)', color: activeTab === 'publish' ? 'white' : 'var(--text-dark)', padding: '6px 15px', fontSize: '0.85rem' }}>
            {t.tab_publish}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--spacing-md)' }}>
          {message.text}
        </div>
      )}

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <>
          {/* Dashboard KPIs Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_residents}</span>
              <div className="stat-num" style={{ color: 'var(--primary)' }}>{kpis.totalResidents || 0}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_res_rate}</span>
              <div className="stat-num">{kpis.resolutionRate || 0}%</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_shops}</span>
              <div className="stat-num" style={{ color: 'var(--secondary)' }}>{kpis.totalBusinesses || 0}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_volunteers}</span>
              <div className="stat-num" style={{ color: '#2563eb' }}>{kpis.totalVolunteers || 0}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_donors}</span>
              <div className="stat-num" style={{ color: 'var(--danger)' }}>{kpis.totalBloodDonors || 0}</div>
            </div>
            <div className="card stat-card">
              <span className="stat-label">{t.kpi_downloads}</span>
              <div className="stat-num" style={{ color: '#7c3aed' }}>{kpis.totalDownloads || 0}</div>
            </div>
          </div>

          {/* Charts Row */}
          {dashboardData ? (
            <div className="grid-2" style={{ gap: '20px', marginBottom: '25px' }}>
              <div className="card">
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} /> {t.chart_comp_cat}</h3>
                <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <Bar data={getComplaintsCategoryChartData()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} /> {t.chart_comp_status}</h3>
                <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <Pie data={getComplaintsStatusChartData()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={18} /> {t.chart_biz_cat}</h3>
                <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <Bar data={getBusinessCategoryChartData()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} /> {t.chart_vol_cat}</h3>
                <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <Pie data={getVolunteerCategoryChartData()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>{t.compiling_metrics}</div>
          )}

          {/* Recent list row */}
          {dashboardData && (
            <div className="grid-2" style={{ gap: '20px' }}>
              <div className="card">
                <h3 style={{ marginBottom: '12px' }}>{t.recent_complaints}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(dashboardData.complaints?.recent || []).map(comp => (
                    <div key={comp._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <span>{comp.title}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{translateStatus(comp.status)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '12px' }}>{t.recent_volunteer}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(dashboardData.complaints?.recentVolunteerRequests || []).map(req => (
                    <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <span>{req.title}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 'bold' }}>{translatePriority(req.priority)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>{t.comp_roster_title}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>{t.th_category}</th>
                <th style={{ padding: '8px' }}>{t.th_title}</th>
                <th style={{ padding: '8px' }}>{t.th_mohalla}</th>
                <th style={{ padding: '8px' }}>{t.th_priority}</th>
                <th style={{ padding: '8px' }}>{t.th_status}</th>
                <th style={{ padding: '8px' }}>{t.th_action}</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{translateCategory(c.category)}</td>
                  <td style={{ padding: '8px' }}>{c.title}</td>
                  <td style={{ padding: '8px' }}>{translateMohalla(c.mohalla)}</td>
                  <td style={{ padding: '8px', color: c.priority === 'Emergency' ? 'var(--danger)' : 'inherit' }}>{translatePriority(c.priority)}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold', color: c.status === 'Resolved' ? 'var(--success)' : 'var(--secondary)' }}>{translateStatus(c.status)}</td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => setUpdatingComplaint(c)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      {t.btn_update_status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: VERIFY SHOPS */}
      {activeTab === 'shops' && (
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>{t.pending_biz_title}</h3>
          {pendingBusinesses.length === 0 ? (
            <p className="text-muted" style={{ padding: 'var(--spacing-md)' }}>{t.no_pending_biz}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {pendingBusinesses.map((biz) => (
                <div key={biz._id} className="card" style={{ background: 'var(--bg-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{biz.businessName}</h4>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>{t.lbl_category}: {translateCategory(biz.category)}</span>
                      <span>{t.lbl_contact}: {biz.contactMobile}</span>
                      <span>{t.lbl_address}: {biz.address}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleVerifyBusiness(biz._id, 'Verified')} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}>
                      <Check size={14} /> {t.btn_approve}
                    </button>
                    <button onClick={() => handleVerifyBusiness(biz._id, 'Rejected')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}>
                      <X size={14} /> {t.btn_reject}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PUBLISH */}
      {activeTab === 'publish' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          {/* Notice Form */}
          <div className="card">
            <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>{t.publish_notice_title}</h3>
            <form onSubmit={handleNoticeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_title}</label>
                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_content}</label>
                <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} required rows="4" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_priority}</label>
                <select value={noticePriority} onChange={(e) => setNoticePriority(e.target.value)}>
                  <option value="Normal">{t.opt_normal}</option>
                  <option value="High">{t.opt_high}</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Send size={14} /> {t.btn_publish_notice}
              </button>
            </form>
          </div>

          {/* Job Form */}
          <div className="card">
            <h3 style={{ marginBottom: '15px', color: 'var(--secondary)' }}>{t.publish_job_title}</h3>
            <form onSubmit={handleJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_job_title}</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_type}</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="Teaching">{t.job_types.Teaching}</option>
                    <option value="Farming">{t.job_types.Farming}</option>
                    <option value="Shop Work">{t.job_types["Shop Work"]}</option>
                    <option value="Skilled Labor">{t.job_types["Skilled Labor"]}</option>
                    <option value="Other">{t.job_types.Other}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_salary}</label>
                  <input type="text" value={jobSalary} placeholder={language === 'hi' ? 'उदा. ₹10,000 / महीना' : 'e.g. ₹10,000 / month'} onChange={(e) => setJobSalary(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{t.lbl_desc}</label>
                <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} required rows="3" />
              </div>
              <button type="submit" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Plus size={14} /> {t.btn_publish_job}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {updatingComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
            <h3>{t.modal_title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.modal_ticket}: "{updatingComplaint.title}"</p>
            
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{t.modal_select_status}</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Pending">{t.status_pending}</option>
                  <option value="In Progress">{t.status_in_progress}</option>
                  <option value="Resolved">{t.status_resolved}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{t.modal_comment}</label>
                <textarea 
                  value={statusComment} 
                  onChange={(e) => setStatusComment(e.target.value)} 
                  placeholder={language === 'hi' ? 'कारण/की गई कार्रवाई...' : language === 'hn' ? 'Reasoning/actions taken...' : 'Reasoning/actions taken...'}
                  required
                  rows="3" 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t.btn_update}</button>
                <button type="button" onClick={() => setUpdatingComplaint(null)} className="btn-secondary" style={{ background: '#78716c' }}>{t.btn_cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
