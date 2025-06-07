import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// 讀取 JSON 檔案
function readJsonFile() {
    try {
        const data = fs.readFileSync('./backend/nail-resv/all_results.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('讀取 JSON 檔案時發生錯誤:', error);
        return null;
    }
}

// 將 JSON 轉換為 CSV 格式的資料
function convertJsonToCsvData(jsonData) {
    const csvData = [];
    
    for (const [filename, tags] of Object.entries(jsonData)) {
        // 跳過有錯誤的項目
        if (tags.Error) {
            console.log(`跳過錯誤項目: ${filename} - ${tags.Error}`);
            continue;
        }
        
        // 將陣列轉換為以逗號分隔的字串，空陣列轉為空字串
        const row = {
            filename: filename,
            style: Array.isArray(tags.style) ? tags.style.join(', ') : '',
            shape: Array.isArray(tags.shape) ? tags.shape.join(', ') : '',
            color: Array.isArray(tags.color) ? tags.color.join(', ') : '',
            texture: Array.isArray(tags.texture) ? tags.texture.join(', ') : '',
            decorations: Array.isArray(tags.decorations) ? tags.decorations.join(', ') : '',
            theme: Array.isArray(tags.theme) ? tags.theme.join(', ') : ''
        };
        
        csvData.push(row);
    }
    
    return csvData;
}

// 建立 CSV Writer
const csvWriter = createCsvWriter({
    path: './supabase/nail_tags.csv',
    header: [
        { id: 'filename', title: 'filename' },
        { id: 'style', title: 'style' },
        { id: 'shape', title: 'shape' },
        { id: 'color', title: 'color' },
        { id: 'texture', title: 'texture' },
        { id: 'decorations', title: 'decorations' },
        { id: 'theme', title: 'theme' }
    ],
    fieldDelimiter: ',',
});

// 主要執行函數
async function convertJsonToCsv() {
    try {
        console.log('開始轉換 JSON 到 CSV...');
        
        // 讀取 JSON 資料
        const jsonData = readJsonFile();
        if (!jsonData) {
            return;
        }
        
        // 轉換為 CSV 格式
        const csvData = convertJsonToCsvData(jsonData);
        console.log(`轉換完成，共 ${csvData.length} 筆資料`);
        
        // 寫入 CSV 檔案
        await csvWriter.writeRecords(csvData);
        console.log('CSV 檔案已成功寫入: nail_tags.csv');
        
        // 顯示統計資訊
        console.log('\n統計資訊:');
        console.log(`總共處理: ${Object.keys(jsonData).length} 個檔案`);
        console.log(`成功轉換: ${csvData.length} 筆資料`);
        console.log(`跳過錯誤: ${Object.keys(jsonData).length - csvData.length} 筆資料`);
        
    } catch (error) {
        console.error('轉換過程中發生錯誤:', error);
    }
}

// 執行轉換
convertJsonToCsv();
