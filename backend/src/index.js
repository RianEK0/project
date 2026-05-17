const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const orgRoutes = require('./routes/organization');
const projectRoutes = require('./routes/projects');
const locationRoutes = require('./routes/location');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activity');

const app = express();

const parseAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return origins;
};

const allowedOrigins = parseAllowedOrigins();
const uploadsDir = path.join(__dirname, '../uploads');
const frontendDistDir = path.join(__dirname, '../../frontend/dist');

app.set('trust proxy', 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: process.env.JSON_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '10mb' }));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/uploads', express.static(uploadsDir));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));

  app.get(/^\/(?!api|uploads|healthz).*/, (req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
