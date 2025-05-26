// routes/availability.js
const express = require('express');
const router  = express.Router();

// POST /api/technicians/:studio/availability
// Body: { availability: { Mon:[...], Wed:[...], … } }
router.post('/:studio/availability', async (req, res, next) => {
  try {
    const { studio }       = req.params;
    const { availability } = req.body;
    if (!availability || typeof availability !== 'object')
      return res.status(400).json({ error: 'Must provide availability object.' });

    const supabase = req.supabase;
    // resolve studio -> artist_id
    const { data: artist, error: e1 } = await supabase
      .from('artists')
      .select('user_id')
      .eq('studio_name', studio)
      .single();
    if (e1 || !artist) throw new Error('Artist not found');

    // clear existing
    await supabase
      .from('artist_available_times')
      .delete()
      .eq('artist_id', artist.user_id);

    // build rows
    const rows = [];
    for (const [day, slots] of Object.entries(availability)) {
      if (!Array.isArray(slots))
        throw new Error(`Slots for ${day} must be an array`);
      for (const start_time of slots) {
        rows.push({
          artist_id:  artist.user_id,
          weekday:    day,
          start_time
        });
      }
    }
    const { error: e2 } = await supabase
      .from('artist_available_times')
      .insert(rows);
    if (e2) throw e2;

    res.status(201).json({ message: 'Availability updated', availability });
  } catch (err) {
    next(err);
  }
});

// GET /api/technicians/:studio/slots?date=YYYY-MM-DD
router.get('/:studio/slots', async (req, res, next) => {
  try {
    const { studio } = req.params;
    const { date }   = req.query;
    if (!date) return res.status(400).json({ error: 'Require date query param.' });

    const supabase = req.supabase;
    // resolve studio -> artist_id
    const { data: artist } = await supabase
      .from('artists')
      .select('user_id')
      .eq('studio_name', studio)
      .single();
    if (!artist) throw new Error('Artist not found');

    // determine weekday
    const weekday = new Date(date + 'T00:00:00').toLocaleString('en-US', { weekday: 'short' });

    // fetch slots
    const { data: avail } = await supabase
      .from('artist_available_times')
      .select('start_time')
      .eq('artist_id', artist.user_id)
      .eq('weekday', weekday);

    // fetch booked
    const { data: booked } = await supabase
      .from('appointments')
      .select('service_time')
      .eq('artist_id', artist.user_id)
      .eq('service_date', date)
      .eq('status', 'confirmed');

    const allSlots = avail.map(r => r.start_time);
    const taken    = booked.map(r => r.service_time);
    const free     = allSlots.filter(s => !taken.includes(s));

    res.json({ artist: studio, date, availableSlots: free });
  } catch (err) {
    console.error('[Availability Route Error]', err.message || err);
    next(err);
  }
});

module.exports = { router };
