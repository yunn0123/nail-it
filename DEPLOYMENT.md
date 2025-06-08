<!-- # Nail-It 部署說明文檔

本文檔說明 Nail-It 美甲預約系統的部署流程，包括 Railway 雲端部署和本地 Docker 部署方式。

## 🏗️ 系統架構

Nail-It 採用前後端分離架構：

- **前端**: Vue.js 3 + Vite + Tailwind CSS
- **後端**: Node.js + Express + Supabase
- **容器化**: Docker + Docker Compose
- **部署平台**: Railway
- **CI/CD**: GitHub Actions

## 🚀 自動化部署流程

### 觸發條件
當以下情況發生時，會自動觸發部署：
- 推送代碼到 `main` 或 `master` 分支
- 修改 `frontend/**` 或 `backend/**` 目錄下的文件
- 手動觸發 GitHub Actions workflow

### 部署流程
1. **代碼檢出**: 從 GitHub 獲取最新代碼
2. **Docker 建置**: 分別建置前端和後端 Docker 映像
3. **測試**: 驗證 Docker 映像建置成功
4. **部署**: 使用 Railway CLI 部署到雲端平台

## 🐳 Docker 容器配置

### 前端容器 (Nginx + Vue.js)
```dockerfile
# 多階段建置
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 後端容器 (Node.js + Express)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY nail-resv/package*.json ./
RUN npm install
COPY nail-resv/ ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔧 環境變數配置

### GitHub Secrets 設定
在 GitHub 倉庫設定頁面新增以下 Secrets：

| Secret 名稱 | 說明 |
|------------|------|
| `RAILWAY_TOKEN` | Railway 平台的 API Token |
| `RAILWAY_FRONTEND_SERVICE_ID` | 前端服務 ID |
| `RAILWAY_BACKEND_SERVICE_ID` | 後端服務 ID |
| `RAILWAY_BACKEND_API_URL` | 後端服務的完整網址 (如: https://your-backend.railway.app) |

### Railway 環境變數

#### 前端服務
```env
VITE_BACKEND_API_URL=https://your-backend-service.railway.app
NODE_ENV=production
```

#### 後端服務
```env
PORT=3000
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
```

### 本地開發環境變數
```env
# backend/.env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
PORT=3000

# frontend/.env
VITE_BACKEND_API_URL=http://localhost:3000
```

## 📦 本地部署方式

### 使用 Docker Compose
```bash
# 1. 設定環境變數
cp .env.example .env
# 編輯 .env 填入相關設定

# 2. 啟動所有服務
docker-compose up -d

# 3. 查看運行狀態
docker-compose ps

# 4. 查看日誌
docker-compose logs -f

# 5. 停止服務
docker-compose down
```

### 手動建置和運行
```bash
# 建置前端
cd frontend
npm install
npm run build
docker build -t nail-it-frontend .

# 建置後端
cd ../backend
docker build -t nail-it-backend .

# 運行容器
docker run -d -p 80:80 --name frontend nail-it-frontend
docker run -d -p 3000:3000 --name backend \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_KEY=your_key \
  nail-it-backend
```

## 🚁 Railway 部署設定

如果部署失敗，請檢查以下事項：

1. GitHub Actions 日誌中的錯誤訊息
2. Docker Hub 上映像是否成功推送
3. Railway 專案日誌

## 目錄結構

```
.
├── .github/workflows/deploy.yml    # GitHub Actions 工作流程
├── docker-compose.yaml             # Docker Compose 配置
├── railway.json                    # Railway 配置
├── deploy.sh                       # 部署腳本
├── .deployments/                   # 部署記錄
│   ├── history.log                 # 部署歷史
│   └── latest.md                   # 最新部署資訊
├── frontend/                       # 前端代碼
│   └── Dockerfile                  # 前端 Docker 配置
└── backend/                        # 後端代碼
    └── Dockerfile                  # 後端 Docker 配置
```

## 版本歷史追蹤

部署記錄會自動保存在 `.deployments` 目錄中，包括：

- 部署時間
- 版本標籤
- 部署環境
- Git 分支和提交
- PR 號（如適用）

這有助於追蹤和審計所有部署活動。 -->
