require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 檢查 nail_images 表格
async function checkNailImagesTable() {
  console.log('🔍 檢查 nail_images 表格...');
  
  try {
    const { data, error } = await supabase
      .from('nail_images')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('❌ nail_images 表格不存在:', error.message);
      console.log('\n📝 請在 Supabase 中建立 nail_images 表格:');
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

    console.log('✅ nail_images 表格存在');
    return true;
  } catch (error) {
    console.error('❌ 檢查表格時發生錯誤:', error);
    return false;
  }
}

// 檢查表格中的資料數量
async function checkDataCount() {
  console.log('📊 檢查資料數量...');
  
  try {
    const { count, error } = await supabase
      .from('nail_images')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ 查詢資料數量失敗:', error.message);
      return;
    }

    console.log(`📋 nail_images 表格中有 ${count} 筆資料`);
    
    if (count === 0) {
      console.log('💡 如果需要匯入資料，請執行: node import-nail-images.js');
    }

    return count;
  } catch (error) {
    console.error('❌ 檢查資料數量時發生錯誤:', error);
  }
}

// 測試搜尋功能
async function testSearch() {
  console.log('🧪 測試搜尋功能...');
  
  try {
    // 測試基本查詢
    const { data, error } = await supabase
      .from('nail_images')
      .select('id, filename, style, artist_id')
      .limit(3);

    if (error) {
      console.error('❌ 測試搜尋失敗:', error.message);
      return;
    }

    console.log(`✅ 成功查詢到 ${data.length} 筆資料`);
    if (data.length > 0) {
      console.log('📋 範例資料:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.filename}`);
        console.log(`     風格: ${item.style?.join(', ') || '無'}`);
        console.log(`     美甲師ID: ${item.artist_id || '無'}`);
      });
    }
  } catch (error) {
    console.error('❌ 測試搜尋時發生錯誤:', error);
  }
}

// 測試風格篩選
async function testStyleFilter() {
  console.log('🎨 測試風格篩選...');
  
  try {
    const { data, error } = await supabase
      .from('nail_images')
      .select('id, filename, style')
      .overlaps('style', ['跳色'])
      .limit(3);

    if (error) {
      console.error('❌ 測試風格篩選失敗:', error.message);
      return;
    }

    console.log(`✅ 「跳色」風格找到 ${data.length} 筆資料`);
    if (data.length > 0) {
      console.log('📋 範例資料:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.filename}`);
      });
    }
  } catch (error) {
    console.error('❌ 測試風格篩選時發生錯誤:', error);
  }
}

// 檢查 artists 關聯
async function checkArtistRelation() {
  console.log('👩‍🎨 檢查美甲師關聯...');
  
  try {
    const { data, error } = await supabase
      .from('nail_images')
      .select(`
        id, 
        filename, 
        artist_id,
        artists!inner(studio_name, city)
      `)
      .limit(3);

    if (error) {
      console.error('❌ 檢查美甲師關聯失敗:', error.message);
      console.log('💡 這可能表示 nail_images 表格中的 artist_id 外鍵設定有問題');
      return;
    }

    console.log(`✅ 成功關聯到 ${data.length} 筆美甲師資料`);
    if (data.length > 0) {
      console.log('📋 範例關聯資料:');
      data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.filename}`);
        console.log(`     工作室: ${item.artists?.studio_name || '無'}`);
        console.log(`     城市: ${item.artists?.city || '無'}`);
      });
    }
  } catch (error) {
    console.error('❌ 檢查美甲師關聯時發生錯誤:', error);
  }
}

// 主要執行函數
async function main() {
  console.log('🚀 開始檢查 nail_images 系統...\n');

  const tableExists = await checkNailImagesTable();
  if (!tableExists) {
    console.log('\n❌ 無法繼續測試，請先建立 nail_images 表格');
    return;
  }

  console.log('');
  const count = await checkDataCount();
  
  if (count > 0) {
    console.log('');
    await testSearch();
    
    console.log('');
    await testStyleFilter();
    
    console.log('');
    await checkArtistRelation();
  }
  
  console.log('\n🏁 檢查完成');
}

// 執行腳本
main().catch(console.error); 