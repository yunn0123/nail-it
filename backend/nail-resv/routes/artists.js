// backend/nail-resv/routes/artists.js
const express = require('express');
const router = express.Router();


router.get('/recommended', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const supabase = req.supabase;

    // 🔥 修正：加入 rating 欄位
    const { data: artists, error } = await supabase
      .from('artists')
      .select(`
        user_id,
        studio_name,
        city,
        district,
        bio,
        styles,
        price_min,
        price_max,
        avatar_url,
        rating
      `)
      .not('studio_name', 'is', null)
      .limit(50);

    if (error) {
      console.error('查詢推薦美甲師失敗:', error);
      return res.status(500).json({
        success: false,
        error: 'Database query failed'
      });
    }

    if (!artists || artists.length === 0) {
      return res.json({
        success: true,
        data: { artists: [] }
      });
    }

    // 過濾出有營業時間的美甲師
    const { data: artistsWithSchedule, error: scheduleError } = await supabase
      .from('artist_available_times')
      .select('artist_id')
      .in('artist_id', artists.map(a => a.user_id));

    if (scheduleError) {
      console.error('查詢營業時間失敗:', scheduleError);
    }

    const artistsWithScheduleIds = new Set(
      artistsWithSchedule?.map(s => s.artist_id) || []
    );

    const validArtists = artists.filter(artist => 
      artistsWithScheduleIds.has(artist.user_id)
    );

    const shuffledArtists = validArtists
      .sort(() => Math.random() - 0.5)
      .slice(0, parseInt(limit))
      .map(artist => ({
        user_id: artist.user_id,
        studio: artist.studio_name,
        city: artist.city,
        district: artist.district,
        rating: artist.rating || 0, // 🔥 使用真實的 rating
        priceLow: artist.price_min || 1000,
        priceHigh: artist.price_max || 1800,
        styles: Array.isArray(artist.styles) ? artist.styles.slice(0, 3) : ['美甲', '設計'],
        image: artist.avatar_url || null
      }));

    console.log(`✅ 成功獲取 ${shuffledArtists.length} 位推薦美甲師`);

    res.json({
      success: true,
      data: {
        artists: shuffledArtists
      }
    });

  } catch (error) {
    console.error('獲取推薦美甲師錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 獲取美甲師資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;

    console.log('Searching for artist with user_id:', id);

    // 🔥 修正：加入 rating 欄位
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('user_id, studio_name, city, district, bio, styles, price_min, price_max, avatar_url, line_url, rating')
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
      priceLow: artistData.price_min || 0,
      priceHigh: artistData.price_max || 0,
      lineUrl: artistData.line_url || '',
      rating: artistData.rating || 0, // 🔥 使用真實的 rating
      image: artistData.avatar_url || 'https://uvzjbmxxrkrnmckrifqs.supabase.co/storage/v1/object/public/avatars/avatar.jpg',
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
    const { studio_name, city, district, bio, styles, priceLow, priceHigh, lineUrl } = req.body; // ← 加上 lineUrl

    const supabase = req.supabase;

    console.log('收到的資料:', req.body);
    console.log('價格資料:', { priceLow, priceHigh });
    console.log('LINE URL:', lineUrl); // ← 加這行

    // 更新 artists 表格
    const { data, error } = await supabase
      .from('artists')
      .update({
        studio_name: studio_name,
        city: city,
        district: district,
        bio: bio,
        styles: styles,
        price_min: priceLow,
        price_max: priceHigh,
        line_url: lineUrl || null  // ← 加上 LINE URL 更新
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

router.put('/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageData } = req.body; // base64 圖片資料
    const supabase = req.supabase;

    // 驗證必要欄位
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    // 驗證用戶權限（確保只能更新自己的頭像）
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // 生成檔案名稱
    const timestamp = Date.now();
    const filename = `${id}/avatar_${timestamp}.jpg`;

    // 處理 base64 圖片
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 刪除舊頭像（如果存在）
    try {
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${id}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
        console.log('已刪除舊頭像');
      }
    } catch (deleteError) {
      console.warn('刪除舊頭像失敗:', deleteError);
      // 不阻止上傳新頭像
    }

    // 上傳新頭像到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase 頭像上傳錯誤:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload avatar'
      });
    }

    // 獲取公開 URL
    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

    const avatarUrl = publicData.publicUrl;

    // 更新資料庫中的 avatar_url
    const { error: updateError } = await supabase
      .from('artists')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', id);

    if (updateError) {
      console.error('更新頭像 URL 失敗:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update avatar URL in database'
      });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('頭像上傳錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});



module.exports = router;