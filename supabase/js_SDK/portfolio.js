require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter: createCsvWriter } = require('csv-writer');
const { createClient } = require('@supabase/supabase-js');

// 暫時註解掉 Supabase 連線，先生成 CSV
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);



// 新增：讀取 artists.csv 的函數
function readArtistsCsv() {
    return new Promise((resolve, reject) => {
        const profiles = [];
        
        fs.createReadStream('../generated_csv/artist.csv')
            .pipe(csv())
            .on('data', (row) => {
                profiles.push({
                    artist_id: row.user_id,
                    place_id: row.place_id,
                });
            })
            .on('end', () => {
                console.log(`從 artist.csv 取得 ${profiles.length} 筆資料`);
                resolve(profiles);
            })
            .on('error', reject);
    });
}

// 讀取 public_url.csv
function readPublicUrlCsv() {
    return new Promise((resolve, reject) => {
        const publicUrls = [];
        
        fs.createReadStream('../generated_csv/public_urls.csv')
            .pipe(csv())
            .on('data', (row) => {
                publicUrls.push({
                    place_id: row.place_id,
                    public_url: row.public_url,
                    filename: row.filename,
                });
            })
            .on('end', () => {
                console.log(`從 public_url.csv 取得 ${publicUrls.length} 筆資料`);
                resolve(publicUrls);
            })
            .on('error', reject);
    });
}

// 新增 portfolio csvWriter 實例
const portfolioCsvWriter = createCsvWriter({
    path: '../generated_csv/portfolio.csv',
    header: [
        { id: 'artist_id', title: 'artist_id' },
        { id: 'image_url', title: 'image_url' },
        { id: 'description', title: 'description' },
        { id: 'tags', title: 'tags' },
        { id: 'created_at', title: 'created_at' },
        { id: 'shape', title: 'shape' },
        { id: 'style', title: 'style' },
        { id: 'color', title: 'color' },
        { id: 'texture', title: 'texture' },
        { id: 'theme', title: 'theme' },
        { id: 'decorations', title: 'decorations' }
    ],
    fieldDelimiter: ',',
});

function readNailTagsCsv() {
    return new Promise((resolve, reject) => {
        const nailTags = [];

        fs.createReadStream('../generated_csv/nail_tags.csv')
            .pipe(csv())
            .on('data', (row) => {
                nailTags.push({
                    filename: row.filename,
                    style: row.style,
                    shape: row.shape,
                    color: row.color,
                    texture: row.texture,
                    decorations: row.decorations,
                    theme: row.theme
                });
            })
            .on('end', () => {
                console.log(`從 nail_tags.csv 取得 ${nailTags.length} 筆資料`);
                resolve(nailTags);
            })
            .on('error', reject);
    });
}

// 生成 portfolio 資料並寫入 CSV
async function generatePortfolioData() {
    try {
        console.log('開始生成 portfolio.csv...');
        
        const artists = await readArtistsCsv();
        const publicUrls = await readPublicUrlCsv();
        const nailTags = await readNailTagsCsv();

        const portfolioData = [];

        for (const artist of artists) {
            // 找到該 artist 對應的 place_id 的所有圖片
            const artistPublicUrls = publicUrls.filter(url => url.place_id === artist.place_id);
            
            for (const urlData of artistPublicUrls) {
                // 根據 filename 找對應的 nail tags
                const matchedTag = nailTags.find(tag => tag.filename === urlData.filename);
                
                if (matchedTag) {
                    portfolioData.push({
                        artist_id: artist.artist_id,
                        image_url: urlData.public_url,
                        description: null,
                        tags: null,
                        created_at: new Date().toISOString(),
                        shape: matchedTag.shape,
                        style: matchedTag.style,
                        color: matchedTag.color,
                        texture: matchedTag.texture,
                        theme: matchedTag.theme,
                        decorations: matchedTag.decorations
                    });
                } else {
                    console.log(`找不到對應的 nail tag: ${urlData.file_name}`);
                }
            }
        }

        console.log(`成功對應 ${portfolioData.length} 筆資料`);
        
        // 寫入 portfolio.csv
        if (portfolioData.length > 0) {
            await portfolioCsvWriter.writeRecords(portfolioData);
            console.log('portfolio.csv 已生成完成');
        } else {
            console.log('沒有資料可寫入 portfolio.csv');
        }

    } catch (error) {
        console.error('生成 portfolio.csv 時發生錯誤:', error);
    }
}

// 執行主要流程
generatePortfolioData();