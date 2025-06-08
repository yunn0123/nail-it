require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 讀取 all_results.json
function loadAllResults() {
  try {
    const data = fs.readFileSync('./all_results.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('讀取 all_results.json 失敗:', error);
    return null;
  }
}

// 從檔案名稱解析 place_id
function extractPlaceId(filename) {
  // 格式1: photo_placeid-ChIJ-9fCcIo9aTQR6kgSIlbD48o_idx-1.jpg
  let match = filename.match(/photo_placeid-([^_]+)_idx-\d+\.jpg/);
  
  // 格式2: photo_placeid-ChIJ0Wt_H9s1aDQRexvxHW0GQes_idx-1.jpg (有底線)
  if (!match) {
    match = filename.match(/photo_placeid-([^_]+(?:_[^_]+)*)_idx-\d+\.jpg/);
  }
  
  // 格式3: 直接嘗試提取 ChIJ 開頭的 place_id
  if (!match) {
    match = filename.match(/photo_placeid-(ChIJ[^_]+)_idx-\d+\.jpg/);
  }
  
  if (match) {
    return match[1];
  }
  
  // 如果都失敗，嘗試更寬鬆的匹配
  const relaxedMatch = filename.match(/photo_placeid-([^_]+)/);
  return relaxedMatch ? relaxedMatch[1] : null;
}

// 根據 place_id 找對應的 artist_id
async function getArtistByPlaceId(placeId) {
  const { data, error } = await supabase
    .from('artists')
    .select('user_id')
    .eq('place_id', placeId)
    .single();

  if (error || !data) {
    console.warn(`找不到 place_id: ${placeId} 對應的美甲師`);
    return null;
  }

  return data.user_id;
}

// 生成 Supabase Storage URL
function generateImageUrl(filename) {
  return `https://uvzjbmxxrkrnmckrifqs.supabase.co/storage/v1/object/public/nailimg/allimgs/${filename}`;
}

// 批次匯入資料
async function importNailImages() {
  console.log('🚀 開始匯入美甲作品資料...');

  const allResults = loadAllResults();
  if (!allResults) {
    console.error('❌ 無法載入 all_results.json');
    return;
  }

  const filenames = Object.keys(allResults);
  console.log(`📁 共有 ${filenames.length} 筆作品資料`);

  // 建立 place_id 到 artist_id 的映射快取
  const placeIdToArtistId = new Map();

  const batchSize = 100; // 每次處理 100 筆
  const results = [];

  for (let i = 0; i < filenames.length; i += batchSize) {
    const batch = filenames.slice(i, i + batchSize);
    console.log(`處理第 ${i + 1}-${Math.min(i + batchSize, filenames.length)} 筆資料...`);

    const batchData = [];

    for (const filename of batch) {
      const imageData = allResults[filename];
      const placeId = extractPlaceId(filename);

      if (!placeId) {
        console.warn(`無法解析 place_id: ${filename}`);
        continue;
      }

      // 檢查快取或查詢 artist_id
      let artistId = placeIdToArtistId.get(placeId);
      if (!artistId) {
        artistId = await getArtistByPlaceId(placeId);
        if (artistId) {
          placeIdToArtistId.set(placeId, artistId);
        }
      }

      // 準備資料
      const record = {
        filename: filename,
        image_url: generateImageUrl(filename),
        style: imageData.style || [],
        shape: imageData.shape || [],
        color: imageData.color || [],
        texture: imageData.texture || [],
        decorations: imageData.decorations || [],
        theme: imageData.theme || [],
        artist_id: artistId,
        place_id: placeId // 額外保存 place_id 方便除錯
      };

      batchData.push(record);
    }

    // 批次插入到 Supabase
    if (batchData.length > 0) {
      const { data, error } = await supabase
        .from('nail_images')
        .insert(batchData);

      if (error) {
        console.error(`❌ 批次 ${i / batchSize + 1} 插入失敗:`, error);
        results.push({ batch: i / batchSize + 1, success: false, error: error.message });
      } else {
        console.log(`✅ 批次 ${i / batchSize + 1} 成功插入 ${batchData.length} 筆資料`);
        results.push({ batch: i / batchSize + 1, success: true, count: batchData.length });
      }
    }

    // 短暫停頓避免過度請求
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 統計結果
  const successfulBatches = results.filter(r => r.success);
  const totalInserted = successfulBatches.reduce((sum, r) => sum + r.count, 0);

  console.log('\n📊 匯入完成統計:');
  console.log(`✅ 成功批次: ${successfulBatches.length}`);
  console.log(`❌ 失敗批次: ${results.filter(r => !r.success).length}`);
  console.log(`📝 總共匯入: ${totalInserted} 筆作品`);
  console.log(`🎨 關聯美甲師: ${placeIdToArtistId.size} 位`);
}

// 檢查 nail_images 表格是否存在
async function checkTable() {
  const { data, error } = await supabase
    .from('nail_images')
    .select('*', { count: 'exact', head: true })
    .limit(1);

  if (error) {
    console.error('❌ nail_images 表格不存在或無法訪問');
    console.log('請先在 Supabase 中建立 nail_images 表格:');
    console.log(`
CREATE TABLE nail_images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  image_url TEXT,
  style TEXT[],
  shape TEXT[],
  color TEXT[],
  texture TEXT[],
  decorations TEXT[],
  theme TEXT[],
  artist_id UUID REFERENCES artists(user_id),
  place_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
    `);
    return false;
  }

  console.log('✅ nail_images 表格存在，可以開始匯入');
  return true;
}

// 主要執行函數
async function main() {
  console.log('🔍 檢查 Supabase 連接和表格...');
  
  const tableExists = await checkTable();
  if (!tableExists) {
    return;
  }

  await importNailImages();
}

// 執行腳本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importNailImages, checkTable }; 