// backend/nail-resv/routes/artists.js
const express = require('express');
const router = express.Router();

// 獲取美甲師資料
// 獲取美甲師資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;

    console.log('Searching for artist with user_id:', id);

    // 從 artists 表格獲取基本資料，包含 price_min 和 price_max
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('user_id, studio_name, city, district, bio, styles, price_min, price_max') // ← 加上價格欄位
      .eq('user_id', id)
      .single();

    if (artistError) {
      console.error('Artist fetch error:', artistError);
      return res.status(404).json({ error: 'Artist not found' });
    }

    if (!artistData) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // 從 auth.users 獲取 email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
    
    if (authError) {
      console.error('Auth user fetch error:', authError);
      return res.status(404).json({ error: 'User not found' });
    }

    // 組合完整的美甲師資料
    const artistProfile = {
      id: artistData.user_id,
      email: authUser.user.email,
      studio: artistData.studio_name,
      city: artistData.city,
      district: artistData.district,
      bio: artistData.bio,
      styles: artistData.styles || [],
      priceLow: artistData.price_min || 0,     // ← 從資料庫讀取，預設 0
      priceHigh: artistData.price_max || 0,    // ← 從資料庫讀取，預設 0
      rating: 0,  // ← 設為 0 或之後從評價計算平均
      image: 'https://nail-it.supabase.co/storage/v1/object/public/avatars/default.png',
      created_at: authUser.user.created_at
    };

    res.json({
      success: true,
      artist: artistProfile
    });

  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新美甲師資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studio_name, city, district, bio, styles, priceLow, priceHigh } = req.body;
    const supabase = req.supabase;

    console.log('收到的資料:', req.body) // ← 加這行
    console.log('價格資料:', { priceLow, priceHigh }) // ← 加這行

    // 更新 artists 表格
    const { data, error } = await supabase
      .from('artists')
      .update({
        studio_name: studio_name,
        city: city,
        district: district,
        bio: bio,
        styles: styles,
        price_min: priceLow,    // ← 加上價格更新
        price_max: priceHigh    // ← 加上價格更新
      })
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('Artist update error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Artist updated successfully',
      artist: data[0]
    });

  } catch (error) {
    console.error('Update artist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;