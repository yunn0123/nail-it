require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客戶端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 生成隨機價格區間（上限大於下限）
function generateRandomPriceRange() {
  // 先生成下限（0-3000）
  const priceMin = Math.floor(Math.random() * 3001);
  // 再生成上限（下限+500 到 5000 之間）
  const priceMax = Math.floor(Math.random() * (5000 - priceMin - 500) + priceMin + 500);
  
  return { priceMin, priceMax };
}

async function updateArtistPrices() {
  try {
    console.log('🔍 開始查詢價格為 null 的美甲師...');
    
    // 查詢所有價格為 null 的美甲師
    const { data: artistsWithNullPrice, error: queryError } = await supabase
      .from('artists')
      .select('user_id, studio_name, price_min, price_max')
      .or('price_min.is.null,price_max.is.null');

    if (queryError) {
      console.error('❌ 查詢失敗:', queryError);
      return;
    }

    console.log(`📊 找到 ${artistsWithNullPrice.length} 位美甲師需要更新價格`);

    if (artistsWithNullPrice.length === 0) {
      console.log('✅ 所有美甲師都已有價格設定');
      return;
    }

    // 顯示即將更新的美甲師
    console.log('\n🎯 將要更新的美甲師:');
    artistsWithNullPrice.forEach(artist => {
      console.log(`   - ${artist.studio_name || 'Unknown'} (ID: ${artist.user_id})`);
    });

    console.log('\n⚡ 開始更新價格...');

    // 逐一更新每位美甲師的價格
    let successCount = 0;
    let failCount = 0;

    for (const artist of artistsWithNullPrice) {
      const { priceMin, priceMax } = generateRandomPriceRange();
      
      const { error: updateError } = await supabase
        .from('artists')
        .update({
          price_min: priceMin,
          price_max: priceMax
        })
        .eq('user_id', artist.user_id);

      if (updateError) {
        console.error(`❌ 更新失敗 ${artist.studio_name || artist.user_id}:`, updateError);
        failCount++;
      } else {
        console.log(`✅ ${artist.studio_name || artist.user_id}: $${priceMin} - $${priceMax}`);
        successCount++;
      }
    }

    console.log('\n📈 更新完成！');
    console.log(`   ✅ 成功: ${successCount} 位`);
    console.log(`   ❌ 失敗: ${failCount} 位`);
    
    // 驗證更新結果
    console.log('\n🔍 驗證更新結果...');
    const { data: updatedArtists, error: verifyError } = await supabase
      .from('artists')
      .select('user_id, studio_name, price_min, price_max')
      .or('price_min.is.null,price_max.is.null');

    if (!verifyError) {
      console.log(`📊 仍有 ${updatedArtists.length} 位美甲師價格為 null`);
    }

  } catch (error) {
    console.error('💥 腳本執行錯誤:', error);
  }
}

// 執行腳本
console.log('🚀 美甲師價格更新腳本開始執行...');
updateArtistPrices()
  .then(() => {
    console.log('🎉 腳本執行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 腳本執行失敗:', error);
    process.exit(1);
  }); 