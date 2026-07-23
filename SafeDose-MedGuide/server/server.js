const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment configurations and AI model overrides
dotenv.config();

const connectDB = require('./src/config/db');
const { initGemini } = require('./src/config/gemini');
const { errorHandler } = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const manufacturerRoutes = require('./src/routes/manufacturerRoutes');
const dosageRoutes = require('./src/routes/dosageRoutes');
const sideEffectRoutes = require('./src/routes/sideEffectRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const aiChatRoutes = require('./src/routes/aiChatRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const roleRequestRoutes = require('./src/routes/roleRequestRoutes');

const app = express();

// Connect to database
connectDB();

// Initialize Gemini AI
initGemini();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/dosages', dosageRoutes);
app.use('/api/side-effects', sideEffectRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/role-requests', roleRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SafeDose MedGuide API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 SafeDose MedGuide Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});
