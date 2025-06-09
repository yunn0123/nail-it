# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


# 前端 API 串接與 Railway 部署注意事項

為了讓專案能順利部署到 Railway，請**不要在程式碼中寫死 localhost 或 127.0.0.1**，而是要用環境變數來設定 API base URL。

## 實作建議

1. **請在 `.env` 或 Railway Variables 設定**
   - 本地開發：
     ```env
     BACKEND_API_URL=http://localhost:3000
     ```
2. **在程式碼中這樣寫 fetch/axios**
   - 以 fetch 為例：
     ```js
     const API_BASE = import.meta.env.BACKEND_API_URL;
     fetch(`${API_BASE}/api/your-endpoint`, {
       method: 'GET',
       // ...其他設定
     })
     ```
   - 以 axios 為例：
     ```js
     import axios from 'axios';
     const api = axios.create({ baseURL: import.meta.env.BACKEND_API_URL });
     api.get('/api/your-endpoint');
     ```

3. **不要寫死**
   ```js
   // 錯誤範例
   fetch('http://localhost:3000/api/xxx')
   ```

4. **Nginx Proxy（如有）**
   - 若有用 Nginx 代理 `/api`，請確保 nginx.conf 也有用 `${BACKEND_API_URL}` 或對應變數。

---

這樣設計，無論本地或 Railway 部署，API 請求都會自動連到正確的後端網址，無需修改程式碼！



# 搜尋功能  

使用者可以點擊頁面正上方的搜尋白框，選擇想要的搜尋方式：  
- **以名稱搜尋**  
- **以圖搜尋**  
- **以條件搜尋**  

## 1. 以名稱搜尋  
1. 輸入美甲師名稱並點擊 **「搜尋」**。  
2. 查看符合名稱關鍵字的美甲師卡片。  
3. 點擊卡片可進入美甲師的個人頁面。  

## 2. 以圖搜尋  
1. 點擊紅框，上傳喜歡的美甲圖片。  
2. 點擊 **「搜尋」** 取得相似美甲作品。  
   - 點擊已上傳的圖片或點選 **「重置」** 可再次上傳新圖片。  
3. 查看有相似作品的美甲師卡片。  
4. 點擊卡片可進入美甲師的個人頁面。  

## 3. 以條件搜尋  
1. 點選所需條件：  
   - **縣市（單選）**：美甲師所在縣市。  
   - **區域（複選）**：美甲師所在區域。  
   - **價格區間（填寫上界與下界）**：美甲師提供的服務價格範圍。  
   - **評分（單選）**：期望美甲師的評分在多少以上。  
   - **風格標籤分類（複選）**：選擇期望的風格類型，點選後顯示該類型的細項標籤，並可進行複選。  
2. 點擊 **「搜尋」** 取得符合條件的美甲作品。  
   - 點擊 **「重置」** 可重新選擇標籤。  
3. 查看符合條件的美甲師卡片。  
4. 點擊卡片可進入美甲師的個人頁面。  
