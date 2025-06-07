require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 搜尋功能 - 使用 Supabase 資料庫
router.get('/search-supabase', async (req, res) => {
  try {
    const {
      style, shape, color,
      texture, decorations, theme,
      limit = 20
    } = req.query;

    const maxLimit = Math.min(parseInt(limit, 10) || 20, 100);

    // 建立查詢
    let query = supabase
      .from('portfolio')
      .select('*');

    // 添加篩選條件
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

    // 格式化回應
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
      .from('portfolio')
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
      .from('portfolio')
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
    console.error('獲取隨機圖片發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router; 