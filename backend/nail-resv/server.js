// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

// init Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS 設定
app.use((req, res, next) => {
  const allowedOrigins = [
    // Railway 部署網址 (需要根據實際情況調整)
    /^https:\/\/.*\.railway\.app$/,  // 所有 Railway 的子域名
    'http://localhost:5173',  // Vite 開發服務器
    'http://localhost',       // Docker 前端容器 (port 80)
    'http://localhost:80',    // Docker 前端容器 (明確端口)
  ];
  
  const origin = req.headers.origin;
  
  // 檢查 origin 是否在允許列表中，或符合 Railway 網址格式
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// inject supabase client into req
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routers
const { router: availabilityRouter } = require('./routes/availability');
const { router: reservationRouter } = require('./routes/reservation');
const searchRouter = require('./routes/search');
const searchSupabaseRouter = require('./routes/searchWithSupabase');
const tagImagesRouter = require('./routes/tagImages');
const { router: registerRouter } = require('./routes/register');
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout'); 
const customersRouter = require('./routes/customers');
const artistsRouter = require('./routes/artists');
const worksRouter = require('./routes/works');

app.use('/api/reservations', reservationRouter);
app.use('/api/technicians', availabilityRouter);
app.use('/api', searchRouter);
app.use('/api', searchSupabaseRouter);
app.use('/api', tagImagesRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRoute);
app.use('/api/logout', logoutRoute);  
app.use('/api/customers', customersRouter);
app.use('/api/artists', artistsRouter);          // 先掛基本的 artists 路由
app.use('/api/artists', availabilityRouter); 
app.use('/api/works', worksRouter); 


// 提供 API 文檔靜態文件
app.use('/docs', express.static(path.join(__dirname, './')));

// API 文檔路由
app.get('/swagger-ui.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-ui.html'));
});

app.get('/swagger-ui-complete.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-ui-complete.html'));
});

app.get('/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});

app.get('/openapi-complete.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(path.join(__dirname, 'openapi-complete.yaml'));
});

// 根路徑重導向到 API 文檔
app.get('/', (req, res) => {
  res.send(`
    <h1>美甲預約系統 API 服務</h1>
    <p>歡迎使用美甲預約系統 API！</p>
    <h2>📚 API 文檔</h2>
    <ul>
      <li><a href="/swagger-ui.html">🎨 美甲標註 API 文檔 (Swagger UI)</a></li>
      <li><a href="/swagger-ui-complete.html">📋 完整系統 API 文檔 (Swagger UI)</a></li>
      <li><a href="/openapi.yaml">📄 美甲標註 OpenAPI 規格</a></li>
      <li><a href="/openapi-complete.yaml">📄 完整系統 OpenAPI 規格</a></li>
    </ul>
    <h2>🔗 主要 API 端點</h2>
    <ul>
      <li><a href="/api/tag">🎨 美甲標註 API</a></li>
      <li><a href="/api/search-supabase">🔍 美甲搜尋 API</a></li>
      <li><a href="/api/register">👤 用戶註冊 API</a></li>
      <li><a href="/api/login">🔑 用戶登入 API</a></li>
    </ul>
    <h2>🏷️ 系統功能</h2>
    <ul>
      <li>🔐 用戶認證系統</li>
      <li>👥 顧客和美甲師管理</li>
      <li>📅 預約管理系統</li>
      <li>🎨 AI 美甲圖片標註</li>
      <li>🔍 智能搜尋功能</li>
      <li>⏰ 營業時間管理</li>
    </ul>
    <p>版本: 1.0.0</p>
    <hr>
    <p><small>💡 提示：查看完整的 API 功能請點擊上方的文檔連結</small></p>
  `);
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


