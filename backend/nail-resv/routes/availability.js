// routes/availability.js
const express = require('express');
const router = express.Router();

// POST /api/artists/:artistId/availability
// 設定美甲師的營業時段
// Body: { availability: { monday: ['10:00', '14:00'], tuesday: [...], ... } }
router.post('/:artistId/availability', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { availability } = req.body;
    
    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({ error: 'Must provide availability object' });
    }

    const supabase = req.supabase;
    
    // 驗證美甲師存在
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('user_id')
      .eq('user_id', artistId)
      .single();
      
    if (artistError || !artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // 清除現有的時段設定
    const { error: deleteError } = await supabase
      .from('artist_available_times')
      .delete()
      .eq('artist_id', artistId);
      
    if (deleteError) {
      console.error('Delete availability error:', deleteError);
      return res.status(500).json({ error: 'Failed to clear existing availability' });
    }

    // 準備新的時段資料
    const rows = [];
    for (const [weekday, timeSlots] of Object.entries(availability)) {
      if (!Array.isArray(timeSlots)) {
        return res.status(400).json({ error: `Time slots for ${weekday} must be an array` });
      }
      
      for (const startTime of timeSlots) {
        rows.push({
          artist_id: artistId,
          weekday: weekday,
          start_time: startTime
        });
      }
    }

    // 如果有時段資料才插入
    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('artist_available_times')
        .insert(rows);
        
      if (insertError) {
        console.error('Insert availability error:', insertError);
        return res.status(500).json({ error: 'Failed to save availability' });
      }
    }

    res.status(201).json({ 
      success: true,
      message: 'Availability updated successfully',
      availability 
    });
    
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/artists/:artistId/availability
router.get('/:artistId/availability', async (req, res) => {
  try {
    const { artistId } = req.params;
    const supabase = req.supabase;

    // 驗證美甲師存在
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('user_id')
      .eq('user_id', artistId)
      .single();
      
    if (artistError || !artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // 獲取時段設定
    const { data: timeSlots, error: slotsError } = await supabase
      .from('artist_available_times')
      .select('weekday, start_time')
      .eq('artist_id', artistId)
      .order('weekday')
      .order('start_time');

    if (slotsError) {
      console.error('Get availability error:', slotsError);
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }

    // 🔥 修正：使用 3字母格式初始化
    const availability = {};
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // ← 改成 3字母
    
    // 初始化所有星期
    weekdays.forEach(day => {
      availability[day] = [];
    });

    // 填入時段資料
    timeSlots.forEach(slot => {
      if (availability[slot.weekday]) {
        availability[slot.weekday].push(slot.start_time);
      }
    });

    console.log('📅 回傳的 availability:', availability); // ← 加上 log

    res.json({
      success: true,
      artistId,
      data: {
        availability
      }
    });
    
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/artists/:artistId/slots?date=YYYY-MM-DD
// 獲取指定日期的可預約時段
router.get('/:artistId/slots', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // 驗證日期格式
    const dateObj = new Date(date + 'T00:00:00');
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const supabase = req.supabase;
    
    // 驗證美甲師存在
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('user_id, studio_name')
      .eq('user_id', artistId)
      .single();
      
    if (artistError || !artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // 獲取星期幾（轉成小寫英文）
    const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekday = weekdayNames[dateObj.getDay()];

    // 獲取該星期的可用時段
    const { data: availableSlots, error: slotsError } = await supabase
      .from('artist_available_times')
      .select('start_time')
      .eq('artist_id', artistId)
      .eq('weekday', weekday)
      .order('start_time');

    if (slotsError) {
      console.error('Get slots error:', slotsError);
      return res.status(500).json({ error: 'Failed to fetch available slots' });
    }

    // 獲取該日期已預約的時段
    const { data: bookedSlots, error: bookedError } = await supabase
      .from('appointments')
      .select('service_time')
      .eq('artist_id', artistId)
      .eq('service_date', date)
      .in('status', ['pending', 'confirmed']); // 待確認和已確認的都算被佔用

    if (bookedError) {
      console.error('Get booked slots error:', bookedError);
      return res.status(500).json({ error: 'Failed to fetch booked slots' });
    }

    // 計算可預約的時段
    const allSlots = availableSlots.map(slot => slot.start_time);
    const takenSlots = bookedSlots.map(slot => slot.service_time);
    const freeSlots = allSlots.filter(slot => !takenSlots.includes(slot));

    res.json({
      success: true,
      artistId,
      artistName: artist.studio_name,
      date,
      weekday,
      availableSlots: freeSlots,
      totalSlots: allSlots.length,
      bookedSlots: takenSlots.length
    });
    
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router };
