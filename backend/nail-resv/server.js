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

// inject supabase client into req
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routers
const { router: availabilityRouter } = require('./routes/availability');
const reservationRouter              = require('./routes/reservation');
const searchRouter = require('./routes/search');
const searchSupabaseRouter = require('./routes/searchWithSupabase');
const tagImagesRouter = require('./routes/tagImages');
const { router: registerRouter } = require('./routes/register');
const loginRoute = require('./routes/login');


app.use('/api/technicians', availabilityRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api', searchRouter);
app.use('/api', searchSupabaseRouter);
app.use('/api', tagImagesRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRoute);



app.get('/', (req, res) => res.send('Nail-Resv API'));

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


