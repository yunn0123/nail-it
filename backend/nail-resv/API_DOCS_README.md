# 美甲預約系統 API 文檔

這個目錄包含完整的美甲預約系統 API 文檔，包括美甲標註、用戶管理、預約系統等所有功能。

## 📁 檔案說明

### API 文檔文件
- `openapi.yaml` - 美甲標註 API 的 OpenAPI 3.0 規格文件
- `openapi-complete.yaml` - 完整系統 API 的 OpenAPI 3.0 規格文件
- `swagger-ui.html` - 美甲標註 API 的 Swagger UI 網頁介面
- `swagger-ui-complete.html` - 完整系統 API 的 Swagger UI 網頁介面
- `swagger-ui-standalone.html` - 獨立版 Swagger UI (解決 CORS 問題)

### 測試和說明文件
- `test-api-docs.js` - API 文檔測試腳本
- `API_DOCS_README.md` - 本說明文件

## 🚀 如何使用

### 1. 查看 API 文檔

#### 方法一：使用瀏覽器（推薦）
1. 啟動您的後端伺服器
2. 選擇要查看的 API 文檔：
   - **完整系統文檔**: `http://localhost:4000/swagger-ui-complete.html`
   - **美甲標註文檔**: `http://localhost:4000/swagger-ui.html`
   - **首頁導覽**: `http://localhost:4000/`
3. 您將看到美觀的 API 文檔介面

#### 方法二：使用 Swagger Editor
1. 前往 [Swagger Editor](https://editor.swagger.io/)
2. 選擇要編輯的 API 規格：
   - 將 `openapi-complete.yaml` 的內容貼上（推薦，包含所有功能）
   - 或將 `openapi.yaml` 的內容貼上（僅美甲標註功能）
3. 即可查看和編輯 API 文檔

### 2. 測試 API

在 Swagger UI 介面中：
1. 點擊 "Try it out" 按鈕
2. 上傳美甲圖片檔案
3. 輸入 Google Places ID
4. 點擊 "Execute" 執行請求

## 📋 API 功能概覽

### 🔐 認證系統
- **POST /api/register** - 用戶註冊（顧客/美甲師）
- **POST /api/login** - 用戶登入
- **POST /api/logout** - 用戶登出

### 👤 用戶管理
- **GET /api/customers/{id}** - 獲取顧客資料
- **PUT /api/customers/{id}** - 更新顧客資料
- **GET /api/customers/{id}/appointments** - 獲取顧客預約記錄
- **GET /api/artists/{id}** - 獲取美甲師資料
- **PUT /api/artists/{id}** - 更新美甲師資料

### ⏰ 營業時間管理
- **GET /api/artists/{artistId}/availability** - 獲取營業時間
- **POST /api/artists/{artistId}/availability** - 設定營業時間
- **GET /api/artists/{artistId}/slots** - 獲取可預約時段

### 📅 預約管理
- **POST /api/reservations/book** - 預約美甲服務
- **GET /api/reservations/artist/{artistId}** - 獲取美甲師預約列表
- **GET /api/reservations/customer/{customerId}** - 獲取顧客預約列表
- **PUT /api/reservations/{appointmentId}/status** - 更新預約狀態

### 🎨 美甲標註 (AI)
- **POST /api/tag** - 批量標註美甲圖片

**功能特色：**
- 支援同時上傳最多 10 張圖片
- 使用 GPT-4o 模型進行 AI 標註
- 自動上傳圖片到 Supabase Storage
- 將結果儲存到資料庫

### 🔍 智能搜尋
- **GET /api/search-supabase** - 搜尋美甲作品

**搜尋條件：**
- 美甲風格、形狀、顏色、質感、裝飾、主題
- 美甲師城市、區域、價格範圍、評分

**標註類別：**
- **風格**: 漸層、跳色、貓眼、單色、法式、手繪、鏡面
- **形狀**: 方形、圓形、橢圓形、方圓形、尖形
- **顏色**: 紅色、橙色、黃色、綠色、藍色、靛色、紫色、黑色、白色、灰色、粉色、金屬銀、裸粉色
- **質感**: 光澤、霧面、亮片、珠光、砂糖感、金屬箔、絲絨
- **裝飾**: 水鑽、雕花、金屬飾片、貝殼、貼紙、畫圖章
- **主題**: 日常、春、夏、秋、冬、韓系、日系、歐美風、簡約、可愛、優雅、繽紛

## 📝 請求範例

### 用戶註冊範例

```bash
# 註冊顧客
curl -X POST "http://localhost:4000/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "customer",
    "email": "customer@example.com",
    "password": "password123",
    "username": "張小美"
  }'

# 註冊美甲師
curl -X POST "http://localhost:4000/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "artist",
    "email": "artist@example.com",
    "password": "password123",
    "studio_name": "美甲小屋",
    "city": "台北市",
    "district": "信義區"
  }'
```

### 美甲標註範例

```bash
curl -X POST "http://localhost:4000/api/tag" \
  -H "Content-Type: multipart/form-data" \
  -F "images=@nail1.jpg" \
  -F "images=@nail2.jpg" \
  -F "placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

### 搜尋範例

```bash
# 搜尋粉色漸層美甲
curl -X GET "http://localhost:4000/api/search-supabase?color=粉色&style=漸層&limit=10"

# 搜尋台北市信義區的美甲師作品
curl -X GET "http://localhost:4000/api/search-supabase?city=台北市&district=信義區"
```

### 使用 JavaScript (FormData)

```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('placeId', 'ChIJN1t_tDeuEmsRUsoyG83frY4');

fetch('/api/tag', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📊 回應範例

```json
{
  "message": "處理完成！成功: 2 張，失敗: 0 張",
  "successful": [
    {
      "originalName": "nail1.jpg",
      "filename": "photo_placeid-ChIJN1t_tDeuEmsRUsoyG83frY4_idx-1_1703123456789.jpg",
      "imageUrl": "https://example.supabase.co/storage/v1/object/public/nailimg/allimgs/...",
      "tags": {
        "style": ["漸層", "手繪"],
        "shape": ["方圓形"],
        "color": ["粉色", "白色"],
        "texture": ["光澤"],
        "decorations": ["水鑽"],
        "theme": ["優雅", "日常"]
      },
      "nailImagesSaved": true
    }
  ],
  "failed": [],
  "totalInAllResults": 125
}
```

## 🔧 開發者注意事項

1. **檔案格式**: 支援 JPG, JPEG, PNG 格式
2. **檔案大小**: 建議每張圖片不超過 10MB
3. **並發限制**: 系統設定最大並發處理數為 4
4. **重試機制**: API 內建重試機制，最多重試 6 次
5. **速率限制**: 請注意 OpenAI API 的速率限制

## 🛠️ 環境設定

確保以下環境變數已正確設定：

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## 📞 支援

如有任何問題或需要協助，請聯繫：
- 📧 Email: support@nailit.com
- 📚 文檔: [API 文檔](./swagger-ui.html)
- 🐛 問題回報: [GitHub Issues](https://github.com/your-org/nail-it/issues) 