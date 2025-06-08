require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// 除錯：檢查環境變數
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Found' : 'Missing');

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 搜尋功能 - 使用 Supabase 資料庫，支援城市、區域、價格區間和評分篩選
router.get('/search-supabase', async (req, res) => {
  try {
    const {
      style, shape, color,
      texture, decorations, theme,
      city, district, priceMin, priceMax, rating,
      limit = 20
    } = req.query;

    const maxLimit = Math.min(parseInt(limit, 10) || 20, 100);

    // 如果有美甲師篩選條件，先查詢符合條件的美甲師
    let filteredArtistIds = null;
    if (city || district || priceMin || priceMax || rating) {
      let artistQuery = supabase.from('artists').select('user_id');

      if (city) {
        artistQuery = artistQuery.ilike('city', `%${city}%`);
      }

      if (district) {
        const districts = Array.isArray(district) ? district : [district];
        artistQuery = artistQuery.in('district', districts);
      }

      if (priceMin && !isNaN(parseFloat(priceMin))) {
        artistQuery = artistQuery.gte('price_max', parseFloat(priceMin));
      }

      if (priceMax && !isNaN(parseFloat(priceMax))) {
        artistQuery = artistQuery.lte('price_min', parseFloat(priceMax));
      }

      if (rating && !isNaN(parseFloat(rating))) {
        artistQuery = artistQuery.gte('rating', parseFloat(rating));
      }

      const { data: artistsData, error: artistsError } = await artistQuery;

      if (artistsError) {
        console.error('查詢美甲師失敗:', artistsError);
        return res.status(500).json({ 
          success: false, 
          error: 'Artists query failed',
          details: artistsError.message 
        });
      }

      filteredArtistIds = artistsData.map(artist => artist.user_id);
      
      // 如果沒有符合條件的美甲師，直接返回空結果
      if (filteredArtistIds.length === 0) {
        return res.json({
          success: true,
          count: 0,
          results: [],
          filters: {
            city, district, priceMin, priceMax, rating,
            style, shape, color, texture, decorations, theme
          }
        });
      }
    }

    // 建立 nail_images 查詢（修改這裡）
    let query = supabase.from('nail_images').select('*');

    // 如果有美甲師篩選，限制 artist_id
    if (filteredArtistIds) {
      query = query.in('artist_id', filteredArtistIds);
    }

    // 檢查是否有任何美甲屬性篩選條件
    const hasNailFilters = style || shape || color || texture || decorations || theme;

    // 添加美甲風格篩選條件（只有在有篩選條件時才應用）
    if (style) {
      const styles = Array.isArray(style) ? style : [style];
      query = query.overlaps('style', styles);
    }

    if (shape) {
      const shapes = Array.isArray(shape) ? shape : [shape];
      query = query.overlaps('shape', shapes);
    }

    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      query = query.overlaps('color', colors);
    }

    if (texture) {
      const textures = Array.isArray(texture) ? texture : [texture];
      query = query.overlaps('texture', textures);
    }

    if (decorations) {
      const decorationsList = Array.isArray(decorations) ? decorations : [decorations];
      query = query.overlaps('decorations', decorationsList);
    }

    if (theme) {
      const themes = Array.isArray(theme) ? theme : [theme];
      query = query.overlaps('theme', themes);
    }

    // 如果沒有任何篩選條件，按創建時間排序顯示最新的圖片
    if (!hasNailFilters && !filteredArtistIds) {
      query = query.order('created_at', { ascending: false });
    }

    // 限制結果數量
    query = query.limit(maxLimit);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查詢錯誤:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database query failed',
        details: error.message 
      });
    }

    // 獲取相關的美甲師資訊
    const artistIds = [...new Set(data.map(item => item.artist_id).filter(Boolean))];
    let artistsInfo = {};

    if (artistIds.length > 0) {
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('user_id, studio_name, city, district, price_min, price_max, rating')
        .in('user_id', artistIds);

      if (!artistsError && artistsData) {
        artistsInfo = artistsData.reduce((acc, artist) => {
          acc[artist.user_id] = artist;
          return acc;
        }, {});
      }
    }

    // 格式化回應，包含美甲師資訊（修改這裡的欄位名稱）
    const results = data.map(item => ({
      id: item.id,
      filename: item.filename,
      imageUrl: item.image_url,
      placeId: item.place_id,
      createdAt: item.created_at,
      nailAttributes: {
        shape: item.shape,
        style: item.style,
        color: item.color,
        texture: item.texture,
        theme: item.theme,
        decorations: item.decorations
      },
      artist: artistsInfo[item.artist_id] ? {
        userId: artistsInfo[item.artist_id].user_id,
        studioName: artistsInfo[item.artist_id].studio_name,
        city: artistsInfo[item.artist_id].city,
        district: artistsInfo[item.artist_id].district,
        priceMin: artistsInfo[item.artist_id].price_min,
        priceMax: artistsInfo[item.artist_id].price_max,
        rating: artistsInfo[item.artist_id].rating
      } : null
    }));

    res.json({
      success: true,
      count: results.length,
      results: results,
      filters: {
        city,
        district,
        priceMin,
        priceMax,
        rating,
        style,
        shape,
        color,
        texture,
        decorations,
        theme
      }
    });

  } catch (error) {
    console.error('搜尋發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// 根據藝術家 ID 搜尋作品
router.get('/search-by-artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 20 } = req.query;

    const maxLimit = Math.min(parseInt(limit, 10) || 20, 100);

    const { data, error } = await supabase
      .from('nail_images')
      .select('*')
      .eq('artist_id', artistId)
      .limit(maxLimit);

    if (error) {
      console.error('Supabase 查詢錯誤:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database query failed',
        details: error.message 
      });
    }

    const results = data.map(item => ({
      id: item.id,
      artistId: item.artist_id,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags,
      createdAt: item.created_at,
      nailAttributes: {
        shape: item.shape,
        style: item.style,
        color: item.color,
        texture: item.texture,
        theme: item.theme,
        decorations: item.decorations
      }
    }));

    res.json({
      success: true,
      count: results.length,
      results: results
    });

  } catch (error) {
    console.error('按藝術家搜尋發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// 獲取隨機圖片
router.get('/random', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 10, 50);

    // 使用 PostgreSQL 的 RANDOM() 函數獲取隨機結果
    const { data, error } = await supabase
      .from('nail_images')
      .select('*')
      .order('RANDOM()')
      .limit(maxLimit);

    if (error) {
      console.error('Supabase 隨機查詢錯誤:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database query failed',
        details: error.message 
      });
    }

    // 獲取相關的美甲師資訊
    const artistIds = [...new Set(data.map(item => item.artist_id).filter(Boolean))];
    let artistsInfo = {};

    if (artistIds.length > 0) {
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('user_id, studio_name, city, district, price_min, price_max, rating')
        .in('user_id', artistIds);

      if (!artistsError && artistsData) {
        artistsInfo = artistsData.reduce((acc, artist) => {
          acc[artist.user_id] = artist;
          return acc;
        }, {});
      }
    }

    const results = data.map(item => ({
      id: item.id,
      filename: item.filename,
      imageUrl: item.image_url,
      placeId: item.place_id,
      createdAt: item.created_at,
      nailAttributes: {
        shape: item.shape,
        style: item.style,
        color: item.color,
        texture: item.texture,
        theme: item.theme,
        decorations: item.decorations
      },
      artist: artistsInfo[item.artist_id] ? {
        userId: artistsInfo[item.artist_id].user_id,
        studioName: artistsInfo[item.artist_id].studio_name,
        city: artistsInfo[item.artist_id].city,
        district: artistsInfo[item.artist_id].district,
        priceMin: artistsInfo[item.artist_id].price_min,
        priceMax: artistsInfo[item.artist_id].price_max,
        rating: artistsInfo[item.artist_id].rating
      } : null
    }));

    res.json({
      success: true,
      count: results.length,
      results: results
    });

  } catch (error) {
    console.error('獲取隨機圖片發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// 搜尋美甲師 - 直接搜尋 artists 表格
router.get('/search-artists', async (req, res) => {
  try {
    const {
      artistname, studioName, name, // 新增店名/美甲師名稱搜尋
      city, district, priceMin, priceMax, rating,
      limit = 20
    } = req.query;

    const maxLimit = Math.min(parseInt(limit, 10) || 20, 100);

    // 建立查詢 - 直接搜尋 artists 表格
    let query = supabase
      .from('artists')
      .select('*');

    // 添加名稱搜尋（支援多種參數名稱）
    const searchName = artistname || studioName || name;
    if (searchName) {
      // 使用 ilike 進行模糊搜尋（不區分大小寫）
      query = query.ilike('studio_name', `%${searchName}%`);
    }

    // 添加地點篩選條件
    if (city) {
      query = query.eq('city', city);
    }

    if (district) {
      // 支援多個區域選擇
      const districts = Array.isArray(district) ? district : [district];
      query = query.in('district', districts);
    }

    // 添加價格區間篩選
    if (priceMin && !isNaN(parseFloat(priceMin))) {
      query = query.gte('price_max', parseFloat(priceMin));
    }

    if (priceMax && !isNaN(parseFloat(priceMax))) {
      query = query.lte('price_min', parseFloat(priceMax));
    }

    // 添加評分篩選 (多少分以上)
    if (rating && !isNaN(parseFloat(rating))) {
      query = query.gte('rating', parseFloat(rating));
    }

    // 限制結果數量並按評分排序
    query = query
      .order('rating', { ascending: false })
      .limit(maxLimit);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase 查詢錯誤:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database query failed',
        details: error.message 
      });
    }

    // 格式化回應
    const results = data.map(item => ({
      id: item.user_id,
      studioName: item.studio_name,
      city: item.city,
      district: item.district,
      priceMin: item.price_min,
      priceMax: item.price_max,
      rating: item.rating,
      bio: item.bio,
      styles: item.styles,
      avatarUrl: item.avatar_url
    }));

    res.json({
      success: true,
      count: results.length,
      results: results,
      filters: {
        artistname: searchName,
        city,
        district,
        priceMin,
        priceMax,
        rating
      }
    });

  } catch (error) {
    console.error('搜尋美甲師發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router; 