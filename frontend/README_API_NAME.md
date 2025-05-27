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
