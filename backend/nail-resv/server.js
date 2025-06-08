// server.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// init Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(express.json());

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
const reservationRouter              = require('./routes/reservation');
const searchRouter = require('./routes/search');
//const tagImagesRouter = require('./routes/tagImages');
const { router: registerRouter } = require('./routes/register');
const loginRoute = require('./routes/login');
const customersRouter = require('./routes/customers');
const artistsRouter = require('./routes/artists');


app.use('/api/technicians', availabilityRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api', searchRouter);
//app.use('/api', tagImagesRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRoute);
app.use('/api/customers', customersRouter);
app.use('/api/artists', artistsRouter);



app.get('/', (req, res) => res.send('Nail-Resv API'));

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


