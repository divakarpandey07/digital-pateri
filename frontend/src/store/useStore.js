import { create } from 'zustand';
import axios from 'axios';

// In development, vite proxy handles /api -> localhost:5000
// In production, VITE_API_URL points to Render backend
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Setup axios instance with dynamic base URL
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pateri_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('pateri_user')) || null,
  token: localStorage.getItem('pateri_token') || null,
  villageId: '6a364068d5b21cfca52c0b1b', // Actual Pateri Database ID
  village: null,
  config: null,
  statistics: null,
  notices: [],
  complaints: [],
  jobs: [],
  donors: [],
  notifications: [],
  isLoading: false,
  error: null,
  language: localStorage.getItem('pateri_lang') || 'en',
  residentProfile: null,
  welcomeMessage: null,

  clearWelcomeMessage: () => set({ welcomeMessage: null }),

  // Set language
  setLanguage: (lang) => {
    localStorage.setItem('pateri_lang', lang);
    set({ language: lang });
  },

  // Set selected village ID
  setVillageId: (id) => set({ villageId: id }),

  // Auth actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      const welcomeMessage = res.data.welcomeMessage || null;
      
      localStorage.setItem('pateri_token', token);
      localStorage.setItem('pateri_user', JSON.stringify(user));
      
      set({ token, user, welcomeMessage, isLoading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, ward, voterId, mobile) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, ward, voterId, mobile });
      const { token, user } = res.data.data;
      const welcomeMessage = res.data.welcomeMessage || null;
      
      localStorage.setItem('pateri_token', token);
      localStorage.setItem('pateri_user', JSON.stringify(user));
      
      set({ token, user, welcomeMessage, isLoading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('pateri_token');
    localStorage.removeItem('pateri_user');
    set({ user: null, token: null });
  },

  // Village Details & Stats
  fetchVillageDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      let targetId = id;
      // If using the fallback ID, resolve to the first active village in the DB
      if (targetId === '6664d999f999f999f999f999' || targetId === '6a27d93cf34b521ef83ba189') {
        try {
          const listRes = await api.get('/villages');
          const firstVillage = listRes.data?.data?.records?.[0];
          if (firstVillage) {
            targetId = firstVillage._id;
          }
        } catch (listErr) {
          console.error('Failed to fetch list of villages', listErr);
        }
      }

      let res;
      try {
        res = await api.get(`/villages/${targetId}`);
      } catch (getErr) {
        // Fallback: search active villages if the specified ID is not found or fails
        const listRes = await api.get('/villages');
        const firstVillage = listRes.data?.data?.records?.[0];
        if (!firstVillage) {
          throw new Error('No active villages found in system');
        }
        targetId = firstVillage._id;
        res = await api.get(`/villages/${targetId}`);
      }

      set({ 
        village: res.data.data.village, 
        config: res.data.data.config,
        statistics: res.data.data.statistics, 
        villageId: res.data.data.village._id,
        isLoading: false 
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch village data';
      set({ error: errMsg, isLoading: false });
    }
  },

  // Notices
  fetchNotices: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/notices?villageId=${get().villageId}`);
      set({ notices: res.data.data.records, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createNotice: async (noticeData) => {
    try {
      await api.post('/notices', { ...noticeData, villageId: get().villageId });
      get().fetchNotices();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create notice' });
      return false;
    }
  },

  // Complaints
  fetchComplaints: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/complaints?villageId=${get().villageId}`);
      set({ complaints: res.data.data.records, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createComplaint: async (complaintData) => {
    try {
      await api.post('/complaints', { ...complaintData, villageId: get().villageId });
      get().fetchComplaints();
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to file complaint' });
      return false;
    }
  },

  upvoteComplaint: async (id) => {
    try {
      await api.post(`/complaints/${id}/upvote`);
      get().fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  },

  updateComplaintStatus: async (id, status, comment) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status, comment });
      get().fetchComplaints();
      return true;
    } catch (err) {
      return false;
    }
  },

  // Jobs
  fetchJobs: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/jobs?villageId=${get().villageId}`);
      set({ jobs: res.data.data.records, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createJob: async (jobData) => {
    try {
      await api.post('/jobs', { ...jobData, villageId: get().villageId });
      get().fetchJobs();
      return true;
    } catch (err) {
      return false;
    }
  },

  // Blood Donors
  fetchDonors: async (bloodGroup = '') => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/donors?villageId=${get().villageId}&bloodGroup=${encodeURIComponent(bloodGroup)}`);
      set({ donors: res.data.data.records, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  // Chatbot Query
  queryChatbot: async (queryText) => {
    try {
      let chatbotSessionId = localStorage.getItem('pateri_chatbot_session');
      if (!chatbotSessionId) {
        chatbotSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('pateri_chatbot_session', chatbotSessionId);
      }
      const res = await api.post('/chatbot/query', { 
        query: queryText, 
        villageId: get().villageId,
        sessionId: chatbotSessionId
      });
      return res.data.data;
    } catch (err) {
      return { reply: 'API is currently offline. Please try again later.', systemSource: 'error' };
    }
  },

  // Resident Claims and Identity
  requestOtp: async (mobile, residentId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/otp/request', { mobile, residentId });
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP request failed';
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  verifyClaim: async (mobile, otp, aadhaarLast4) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/otp/verify', { mobile, otp, aadhaarLast4 });
      if (res.data.needsAadhaar) {
        set({ isLoading: false });
        return { success: true, needsAadhaar: true };
      }
      const { token, user } = res.data.data;
      const welcomeMessage = res.data.welcomeMessage || null;
      
      localStorage.setItem('pateri_token', token);
      localStorage.setItem('pateri_user', JSON.stringify(user));
      
      set({ 
        token,
        user, 
        residentProfile: null, 
        welcomeMessage,
        isLoading: false 
      });
      return { success: true, needsAadhaar: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  fetchMyResidentProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/residents/me');
      set({ residentProfile: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ isLoading: false });
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.setItem('pateri_session_expired', 'true');
        get().logout();
      }
      return null;
    }
  },

  fetchPublicResidentProfile: async (residentId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/residents/public/${residentId}`);
      set({ isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ isLoading: false });
      return null;
    }
  },

  requestCertificate: async (type, reason, details) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/residents/certificates', { type, reason, details });
      set({ isLoading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Certificate request failed';
      set({ error: msg, isLoading: false });
      return false;
    }
  }
}));
