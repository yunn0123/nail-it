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
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
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


