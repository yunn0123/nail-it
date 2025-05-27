# Nail-It

> 🚀 **線上體驗網址（Railway Demo）**：
> 
> https://nail-it-frontend.railway.app/
> 
> ⚠️ 此網址為 Railway 免費方案部署，約一週後會自動停止運行，如需再次體驗請聯絡專案作者或重新部署。

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/你的GitHub用户名/nail-it/deploy.yml?label=部署)
![Docker Pulls](https://img.shields.io/docker/pulls/yunn0123/nail-it-frontend)
![Railway Deployment](https://img.shields.io/badge/railway-deployed-success)

美甲預約與設計分享平台

## 專案說明

Nail-It 是一個美甲預約與設計分享平台，讓用戶可以瀏覽美甲設計、預約服務，並分享自己的美甲作品。

## 技術堆疊

- **前端**: Vue 3 + Vite
- **後端**: Node.js + Express
- **資料庫**: Supabase
- **部署**: Docker + Railway + GitHub Actions

## 架構

專案採用前後端分離架構：

- **前端**: `/frontend` - Vue 3 單頁應用程式
- **後端**: `/backend` - Node.js API 服務

## 開發環境設置

### 需求

- Node.js 16+
- Docker 和 Docker Compose
- Git

### 本地開發

1. 克隆倉庫:

```bash
git clone https://github.com/yunn0123/nail-it.git
cd nail-it
```

2. 安裝依賴:

```bash
# 前端
cd frontend
npm install

# 後端
cd ../backend/nail-resv
npm install
```

3. 啟動開發服務器:

```bash
# 前端 (在 /frontend 目錄)
npm run dev

# 後端 (在 /backend/nail-resv 目錄)
npm run dev
```

### 使用 Docker 運行

```bash
docker-compose up -d
```

## 部署

詳細的部署指南請查看 [DEPLOYMENT.md](DEPLOYMENT.md)。

簡要步驟:

1. 提交程式碼到 GitHub
2. GitHub Actions 自動構建 Docker 映像並標記版本
3. 自動部署到 Railway

## 自動化 CI/CD

專案使用 GitHub Actions 進行持續集成和部署:

- 每次 PR 都會創建預覽環境
- 合併到主分支會部署到生產環境
- 所有部署都有唯一的版本標籤

## 許可證

MIT
