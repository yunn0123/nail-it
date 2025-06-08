const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testSearch() {
  console.log('🧪 開始測試搜尋功能...\n');

  // 測試 1: 無篩選條件的搜尋（應該返回結果）
  console.log('📝 測試 1: 無篩選條件搜尋');
  try {
    const response = await axios.get(`${BASE_URL}/search-supabase?limit=5`);
    console.log('✅ 無篩選條件搜尋成功');
    console.log(`   結果數量: ${response.data.count}`);
    console.log(`   有美甲師資訊: ${response.data.results.filter(r => r.artist).length}`);
    console.log(`   有價格資訊: ${response.data.results.filter(r => r.artist && r.artist.priceMin !== null).length}`);
  } catch (error) {
    console.error('❌ 無篩選條件搜尋失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 2: 隨機圖片
  console.log('📝 測試 2: 隨機圖片');
  try {
    const response = await axios.get(`${BASE_URL}/random?limit=5`);
    console.log('✅ 隨機圖片獲取成功');
    console.log(`   結果數量: ${response.data.count}`);
    console.log(`   有美甲師資訊: ${response.data.results.filter(r => r.artist).length}`);
    console.log(`   有價格資訊: ${response.data.results.filter(r => r.artist && r.artist.priceMin !== null).length}`);
    
    if (response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      console.log('   第一筆資料:');
      console.log(`     圖片: ${firstResult.imageUrl ? '有' : '無'}`);
      console.log(`     美甲師: ${firstResult.artist ? firstResult.artist.studioName : '無'}`);
      console.log(`     價格: ${firstResult.artist && firstResult.artist.priceMin !== null 
        ? `$${firstResult.artist.priceMin} - $${firstResult.artist.priceMax}` : '無'}`);
    }
  } catch (error) {
    console.error('❌ 隨機圖片獲取失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 3: 按城市搜尋
  console.log('📝 測試 3: 按城市搜尋');
  try {
    const response = await axios.get(`${BASE_URL}/search-supabase?city=台北市&limit=3`);
    console.log('✅ 城市搜尋成功');
    console.log(`   結果數量: ${response.data.count}`);
    console.log(`   有美甲師資訊: ${response.data.results.filter(r => r.artist).length}`);
    
    if (response.data.results.length > 0) {
      response.data.results.forEach((result, index) => {
        if (result.artist) {
          console.log(`   ${index + 1}. ${result.artist.studioName} - ${result.artist.city} - $${result.artist.priceMin}-${result.artist.priceMax}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ 城市搜尋失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 4: 按價格區間搜尋
  console.log('📝 測試 4: 按價格區間搜尋');
  try {
    const response = await axios.get(`${BASE_URL}/search-supabase?priceMin=1000&priceMax=2000&limit=3`);
    console.log('✅ 價格區間搜尋成功');
    console.log(`   結果數量: ${response.data.count}`);
    
    if (response.data.results.length > 0) {
      response.data.results.forEach((result, index) => {
        if (result.artist) {
          console.log(`   ${index + 1}. ${result.artist.studioName} - $${result.artist.priceMin}-${result.artist.priceMax}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ 價格區間搜尋失敗:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 5: 按風格搜尋
  console.log('📝 測試 5: 按風格搜尋');
  try {
    const response = await axios.get(`${BASE_URL}/search-supabase?style=漸層&limit=3`);
    console.log('✅ 風格搜尋成功');
    console.log(`   結果數量: ${response.data.count}`);
    
    if (response.data.results.length > 0) {
      response.data.results.forEach((result, index) => {
        console.log(`   ${index + 1}. 風格: ${result.nailAttributes.style.join(', ')}`);
        if (result.artist) {
          console.log(`       美甲師: ${result.artist.studioName} - $${result.artist.priceMin}-${result.artist.priceMax}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ 風格搜尋失敗:', error.message);
  }

  console.log('\n🎉 搜尋功能測試完成！');
}

// 執行測試
testSearch().catch(console.error); 