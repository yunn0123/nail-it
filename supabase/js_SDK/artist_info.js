import { createClient } from '@supabase/supabase-js'
import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 建立 csvWriter 實例
const csvWriter = createCsvWriter({
    path: './supabase/artist.csv',
    header: [
        { id: 'studio_name', title: 'studio_name' },
        { id: 'place_id', title: 'place_id' },
        { id: 'city', title: 'city' },
        { id: 'district', title: 'district' },
        { id: 'price_min', title: 'price_min' },
        { id: 'price_max', title: 'price_max' },
        { id: 'bio', title: 'bio' },
        { id: 'styles', title: 'styles' },
        { id: 'avatar_url', title: 'avatar_url' },
        { id: 'rating', title: 'rating' },
        { id: 'user_id', title: 'user_id' }
    ],
    fieldDelimiter: ',',
});

// 新增：建立 profiles csvWriter 實例
const profilesCsvWriter = createCsvWriter({
    path: './supabase/profiles.csv',
    header: [
        { id: 'id', title: 'id' },
        { id: 'role', title: 'role' },
        { id: 'full_name', title: 'full_name' },
        { id: 'created_at', title: 'created_at' }
    ],
    fieldDelimiter: ',',
});

// 2. 讀取 public_urls.csv 取得唯一的 place_id 清單
function getUniquePlaceIds() {
    return new Promise((resolve, reject) => {
        const placeIds = new Set(); // 使用 Set 自動去重
        
        fs.createReadStream('./supabase/public_urls.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (row.place_id && row.place_id.trim() !== '') {
                    placeIds.add(row.place_id.trim());
                }
            })
            .on('end', () => {
                console.log(`從 public_urls.csv 取得 ${placeIds.size} 個唯一的 place_id`);
                resolve(Array.from(placeIds));
            })
            .on('error', reject);
    });
}

// 3. 讀取 nail_salons.csv 並根據 place_id 篩選
function getNailSalonsData(targetPlaceIds) {
    return new Promise((resolve, reject) => {
        const matchedSalons = [];
        
        fs.createReadStream('./supabase/nail_salons.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (targetPlaceIds.includes(row.place_id)) {
                    matchedSalons.push(row);
                }
            })
            .on('end', () => {
                console.log(`從 nail_salons.csv 找到 ${matchedSalons.length} 筆符合的店家資料`);
                resolve(matchedSalons);
            })
            .on('error', reject);
    });
}

// 新增：處理 profiles 的獨立函數
async function syncProfiles() {
    try {
        console.log('開始同步 profiles...');
        
        // 取得前 75 筆 auth 用戶 (第 1 頁 50 筆 + 第 2 頁 25 筆)
        let allUsers = [];
        
        // 第 1 頁 (1-50)
        const { data: page1Users, error: page1Error } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 50
        });
        if (page1Error) {
            console.error('查詢第 1 頁用戶時發生錯誤:', page1Error);
            return;
        }
        allUsers = allUsers.concat(page1Users.users);
        console.log(`取得第 1 頁，共 ${page1Users.users.length} 個用戶`);
        
        // 第 2 頁 (51-75，只取前 25 筆)
        const { data: page2Users, error: page2Error } = await supabase.auth.admin.listUsers({
            page: 2,
            perPage: 50
        });
        if (page2Error) {
            console.error('查詢第 2 頁用戶時發生錯誤:', page2Error);
            return;
        }
        // 只取前 25 筆來湊足 75 筆
        allUsers = allUsers.concat(page2Users.users.slice(0, 25));
        console.log(`取得第 2 頁前 25 筆，總共 ${allUsers.length} 個用戶`);
        
        // 找出符合條件的 artist 用戶
        const artistProfiles = [];
        allUsers.forEach(user => {
            // 檢查 email 是否符合 artist${id}@example.com 格式
            if (user.email.match(/^artist\d+@example\.com$/)) {
                artistProfiles.push({
                    id: user.id,
                    role: "artist",
                    full_name: user.user_metadata?.full_name || '',
                    created_at: new Date().toISOString(),
                });
            }
        });
        
        console.log(`找到 ${artistProfiles.length} 個 artist 用戶`);
        
        // 寫入 CSV 檔案
        if (artistProfiles.length > 0) {
            await profilesCsvWriter.writeRecords(artistProfiles);
            console.log('profiles.csv 已寫入完成');
        } else {
            console.log('沒有找到符合條件的 artist 用戶');
        }
        
    } catch (error) {
        console.error('同步 profiles 時發生錯誤:', error);
    }
}

// 4. 主要處理流程
async function processArtistData() {
    try {
        // 取得唯一的 place_id 清單
        const uniquePlaceIds = await getUniquePlaceIds();
        
        // 根據 place_id 取得對應的店家資料
        const nailSalons = await getNailSalonsData(uniquePlaceIds);
        
        // 失敗的 artist_id 清單
        const failedIds = [64, 65, 67, 69, 72, 74];
        console.log('將重新註冊失敗的 artist_id:', failedIds);
        
        const processedRows = [];
        
        console.log('開始處理店家資料並註冊用戶...');
        
        for (const failedId of failedIds) {
            // 計算對應的 salon 索引 (artist_id - 1，因為陣列從0開始)
            const salonIndex = failedId - 1;
            
            if (salonIndex >= nailSalons.length) {
                console.log(`跳過 artist_id ${failedId}，超出 salon 資料範圍`);
                continue;
            }
            
            const salon = nailSalons[salonIndex];
            const email = `artist${failedId}@example.com`;
            const password = 'artist1111';
            
            console.log(`正在重新註冊第 ${failedId} 個用戶: ${salon.name} (${salon.place_id})`);
            
            // 從 salon.address 取 city, district
            const cityMatch = salon.address.match(/ ([^,]*?) City/);
            const city = cityMatch ? cityMatch[1].trim() : '';
            const districtMatch = salon.address.match(/, ([^,]*?) District/);
            const district = districtMatch ? districtMatch[1].trim() : '';
            
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: salon.name }
                }
            });

            await sleep(5000); // 等待 5 秒以避免 API rate limit

            if (signUpError) {
                console.error(`註冊用戶失敗 (artist_id: ${failedId}, place_id: ${salon.place_id}):`, signUpError);
                if (signUpError.status === 429) {
                    console.log('等待 2 秒後再嘗試下一筆...');
                    await sleep(2000);
                }
                continue;
            }

            const userId = signUpData.user.id;
            console.log(`用戶 ${email} 註冊成功，user_id: ${userId}`);
        }

        console.log(`完成用戶註冊，共處理 ${processedRows.length} 筆資料`);

    } catch (error) {
        console.error('處理過程中發生錯誤:', error);
    }
}

// 新增：讀取 profiles.csv 的函數
function readProfilesCsv() {
    return new Promise((resolve, reject) => {
        const profiles = [];
        
        fs.createReadStream('./supabase/profiles.csv')
            .pipe(csv())
            .on('data', (row) => {
                profiles.push({
                    id: row.id,
                    full_name: row.full_name
                });
            })
            .on('end', () => {
                console.log(`從 profiles.csv 取得 ${profiles.length} 筆資料`);
                resolve(profiles);
            })
            .on('error', reject);
    });
}

// 新增：讀取完整 nail_salons.csv 的函數
function readAllNailSalons() {
    return new Promise((resolve, reject) => {
        const salons = [];
        
        fs.createReadStream('./supabase/nail_salons.csv')
            .pipe(csv())
            .on('data', (row) => {
                // 從 address 取 city, district
                const districtMatch = row.address.match(/, ([^,]*?) District/) || row.address.match(/, ([^,]*?) Township/) || row.address.match(/, ([^,]*?) City/);
                const district = districtMatch ? districtMatch[1].trim() : '';
                
                salons.push({
                    place_id: row.place_id,
                    name: row.name,
                    rating: row.rating,
                    bio: row.website || row.map_url,
                    city: row.city,
                    district: district
                });
            })
            .on('end', () => {
                console.log(`從 nail_salons.csv 取得 ${salons.length} 筆資料`);
                resolve(salons);
            })
            .on('error', reject);
    });
}

// 新增：生成 artist.csv 的函數
async function generateArtistCsv() {
    try {
        console.log('開始生成 artist.csv...');
        
        // 讀取 profiles.csv 和 nail_salons.csv
        const profiles = await readProfilesCsv();
        const salons = await readAllNailSalons();
        
        // 建立 salon name 到 salon 資料的映射
        const salonMap = new Map();
        salons.forEach(salon => {
            salonMap.set(salon.name, salon);
        });
        
        // 對應 profiles 和 salons
        const artistData = [];
        profiles.forEach(profile => {
            const matchedSalon = salonMap.get(profile.full_name);
            
            if (matchedSalon) {
                artistData.push({
                    user_id: profile.id,
                    studio_name: profile.full_name,
                    place_id: matchedSalon.place_id,
                    city: matchedSalon.city,
                    district: matchedSalon.district,
                    price_min: null,
                    price_max: null,
                    bio: matchedSalon.bio,
                    styles: null,
                    avatar_url: null,
                    rating: matchedSalon.rating
                });
            } else {
                console.log(`無法找到對應的 salon: ${profile.full_name}`);
            }
        });
        
        console.log(`成功對應 ${artistData.length} 筆資料`);
        
        // 寫入 artist.csv
        if (artistData.length > 0) {
            await csvWriter.writeRecords(artistData);
            console.log('artist.csv 已寫入完成');
        }
        else {
            console.log('沒有找到符合條件的 artist 資料');
        }
    }
    catch (error) {
        console.error('生成 artist.csv 時發生錯誤:', error);
    }
}

generateArtistCsv();