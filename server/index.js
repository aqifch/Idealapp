require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Supabase Admin Client ────────────────────────────────────────────────────
// Service role key gives admin access for token verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── CORS — Environment Based (C4 Fix) ───────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://idealpoint.pk']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST']
}));

// ─── Auth Middleware (C3 Fix) ─────────────────────────────────────────────────
async function verifySupabaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}

// ─── Uploads Directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// ─── Multer Config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// H6 Fix: SVG removed — can contain embedded JS (XSS risk)
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

// ─── Upload Endpoint (Protected) ─────────────────────────────────────────────
app.post('/api/upload', verifySupabaseToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Upload server is running',
    env: process.env.NODE_ENV || 'development'
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🗂️  Static files: http://localhost:${PORT}/uploads/`);
  console.log(`🔒 Auth: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Enabled' : '⚠️ DISABLED — set SUPABASE_SERVICE_ROLE_KEY'}`);
});
