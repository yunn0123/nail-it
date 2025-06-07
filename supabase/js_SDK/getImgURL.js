import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'; // 添加這行來載入 .env 檔案
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 獲取所有圖片的filename
const { data, error } = await supabase
  .storage
  .from('nailimg')
  .list('allimgs', { limit: 100, offset: 0 }); // 這裡只要給資料夾名稱

// 合併所有批次的圖片資料
const allData = data ? [...data] : [];

const batches = [
  { limit: 100, offset: 100 },
  { limit: 100, offset: 200 },
  { limit: 100, offset: 300 },
  { limit: 100, offset: 400 },
  { limit: 100, offset: 500 }
];

for (const batch of batches) {
  const { data: batchData } = await supabase
    .storage
    .from('nailimg')
    .list('allimgs', batch);
  
  if (batchData && batchData.length > 0) {
    allData.push(...batchData);
  }
}

// 取得每個圖片的公開URL
const fileNames = allData.map(item => item.name); // 取得所有 file name

console.log('取得圖片數量:', fileNames.length);

const publicUrls = fileNames.map(name => {
  const { data } = supabase
    .storage
    .from('nailimg')
    .getPublicUrl('allimgs/' + name);
  return data.publicUrl;
});

// 取得圖片檔名中的place_id
const placeIds = fileNames.map(fn => {
  const match = fn.match(/placeid-(.*)_idx/);
  return match ? match[1] : null;
});

// 建立 CSV 內容，包含表頭
const csvHeader = 'place_id,filename,public_url\n';
const csvRows = fileNames.map((name, index) => 
  `${placeIds[index] || ''},${name},${publicUrls[index]}`
).join('\n');

const csvContent = csvHeader + csvRows;

// 儲存到檔案
fs.writeFileSync('./supabase/public_urls.csv', csvContent, 'utf8');

console.log(`成功產生 ${fileNames.length} 個圖片的 URL，已儲存至 public_urls.csv`);
console.log('CSV 格式: place_id, filename, public_url');