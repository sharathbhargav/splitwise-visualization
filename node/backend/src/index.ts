import express from 'express';
import cors from 'cors';
import session from 'express-session';
import './types/session';
import { uploadRoutes } from './routes/uploadRoutes';
import { storesRouter } from './routes/stores';
import { analysisRouter } from './routes/analysis';
import { advancedAnalyticsRouter } from './routes/advancedAnalytics';

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // In production, use environment variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Register routes
app.use('/api/upload', uploadRoutes);
app.use('/api/stores', storesRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/advanced-analytics', advancedAnalyticsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});