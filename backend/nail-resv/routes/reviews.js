// routes/reviews.js
const express = require('express');
const router = express.Router();

// GET /api/reviews/pending/:customerId
// 顯示顧客可填寫的評論紀錄（只包含completed且在30天內的預約）
router.get('/pending/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const supabase = req.supabase;

  try {
    const { data: reviews, error } = await supabase
      .from('appointments')
      .select(`
        id,
        service_date,
        service_time,
        created_at,
        artists(user_id, studio_name, avatar_url),
        reviews(id, rating, review_text, created_at)
      `)
      .eq('customer_id', customerId)
      .eq('status', 'completed')
      .order('service_date', { ascending: false });

    if (error) {
      console.error('Fetch reviews error:', error);
      return res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }

    const now = new Date();
    const filtered = reviews.filter((apt) => {
      const created = new Date(apt.created_at);
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    const formatted = filtered.map((apt) => ({
      appointmentId: apt.id,
      artistId: apt.artists.user_id,
      studio: apt.artists.studio_name,
      avatar: apt.artists.avatar_url,
      date: `${apt.service_date} ${apt.service_time}`,
      rating: apt.reviews?.rating || 0,
      comment: apt.reviews?.review_text || ''
    }));

    res.json({ success: true, reviews: formatted });
  } catch (err) {
    console.error('Pending reviews error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reviews/:appointmentId
// 更新評論（限 30 天內）
router.put('/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  const { rating, review_text } = req.body;
  const supabase = req.supabase;

  // 🔥 debug log 開始
  console.log('🔥 appointmentId:', appointmentId);
  console.log('🔥 review payload:', { rating, review_text });

  try {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, created_at')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.log('❌ appointment 找不到：', fetchError || 'not found');
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const now = new Date();
    const created = new Date(appointment.created_at);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      console.log('⛔ 超過 30 天，不能再更新');
      return res.status(403).json({ error: 'Review period expired' });
    }

    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single();

    if (existingReview) {
      console.log('🔁 已有 review，準備更新');

      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          rating,
          review_text
        })
        .eq('appointment_id', appointmentId);

      if (updateError) {
        console.log('❌ 更新失敗：', updateError);
        return res.status(500).json({ error: 'Failed to update review' });
      }

    } else {
      console.log('🆕 沒有 review，準備插入');

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          appointment_id: appointmentId,
          rating,
          review_text,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.log('❌ 插入失敗：', insertError);
        return res.status(500).json({ error: 'Failed to insert review' });
      }
    }

    console.log('✅ 處理完成，返回 success');
    res.json({ success: true, message: 'Review saved successfully' });

  } catch (err) {
    console.error('💥 Exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = { router };