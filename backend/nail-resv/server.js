// server.js
const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;

// Routers
const { router: availabilityRouter } = require('./routes/availability');
const reservationRouter              = require('./routes/reservation');
const searchRouter                   = require('./routes/search');
const tagImagesRouter                = require('./routes/tagImages');

app.use(express.json());

// Mount routes
app.use('/api/technicians', availabilityRouter);
app.use('/api/reservations', reservationRouter);

// New endpoints
// GET  /api/search?style=…&texture=…
// POST /api/tag   (form-data field: images, up to 10 files)
app.use('/api', searchRouter);
app.use('/api', tagImagesRouter);


// Root
app.get('/', (req, res) => res.send('Nail-Resv API 🚀'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
