const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment configurations
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Request logger
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
});

// Security middleware
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static Excel files from data directory
app.use('/data', express.static(path.join(__dirname, '../data')));

// Rate Limiting (Capped at 150 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Digital Pateri Smart Village API'
  });
});

// Routing Mount Points
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/villages', require('./routes/villageRoutes'));
app.use('/api/v1/residents', require('./routes/residentRoutes'));
app.use('/api/v1/complaints', require('./routes/complaintRoutes'));
app.use('/api/v1/jobs', require('./routes/jobRoutes'));
app.use('/api/v1/notices', require('./routes/noticeRoutes'));
app.use('/api/v1/donors', require('./routes/donorRoutes'));
app.use('/api/v1/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/v1/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/v1/documents', require('./routes/documentRoutes'));
app.use('/api/v1/agriculture', require('./routes/agricultureRoutes'));
app.use('/api/v1/registry', require('./routes/registryRoutes'));
app.use('/api/v1/sos', require('./routes/sosRoutes'));
app.use('/api/v1/crops', require('./routes/cropRoutes'));
app.use('/api/v1/schemes', require('./routes/schemeRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    errorCode: 'ROUTE_NOT_FOUND'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    success: false,
    message,
    errorCode
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Initialize daily Mandi scheduler tasks
  const { initScheduler } = require('./config/scheduler');
  initScheduler();
});

// Trigger nodemon restart

