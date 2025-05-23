# CI/CD 文件說明

本文檔說明了專案中與 CI/CD 相關的重要文件及其用途。

## 核心文件

### 配置文件

| 文件路徑 | 用途 |
|---------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 工作流程定義，用於自動部署到 Railway |
| `railway.json` | Railway 平台配置文件，定義部署參數和環境設置 |
| `docker-compose.yaml` | Docker Compose 配置，定義多容器服務 |

### Docker 相關文件

| 文件路徑 | 用途 |
|---------|------|
| `frontend/Dockerfile` | 前端主要 Docker 構建文件 |
| `frontend/Dockerfile.inline` | 前端備選 Docker 構建文件，使用內聯 nginx 配置 |
| `backend/Dockerfile` | 後端 Docker 構建文件 |
| `Dockerfile` | 根目錄 Dockerfile，用於 Railway 多容器部署 |

### 腳本文件

| 文件路徑 | 用途 |
|---------|------|
| `fix-nginx-path.sh` | 修復 nginx 配置路徑問題的腳本，提供多種解決方案 |
| `cleanup-cicd-files.sh` | 整理 CI/CD 相關文件的腳本 |

### 文檔文件

| 文件路徑 | 用途 |
|---------|------|
| `DEPLOYMENT_GUIDE.md` | 部署指南，包含常見問題解決方案 |
| `DEPLOYMENT.md` | 詳細部署說明文檔 |

## 文件關係圖

```
.github/workflows/deploy.yml ---> Railway 部署 ---> railway.json
                                      |
                                      v
                              使用 Docker 構建
                                      |
                                      v
           +------------------------+----------------------------+
           |                        |                            |
  frontend/Dockerfile   frontend/Dockerfile.inline   backend/Dockerfile
           |                        |                            |
           +------------------------+----------------------------+
                                      |
                                      v
                              docker-compose.yaml
```

## CI/CD 流程

1. 開發者提交代碼到 GitHub
2. GitHub Actions 工作流程觸發 (deploy.yml)
3. 構建 Docker 映像
4. 部署到 Railway 平台
5. Railway 使用 railway.json 配置進行部署

## 最佳實踐

1. **保持文件精簡**：只保留必要的文件，避免多餘的配置文件和腳本
2. **統一配置**：確保 Docker 構建配置與 Railway 部署配置一致
3. **版本控制**：將所有 CI/CD 配置文件納入版本控制
4. **文檔更新**：每次對部署流程進行修改時，更新相關文檔

## 故障排除

如果部署過程中遇到問題，請參考 `DEPLOYMENT_GUIDE.md` 獲取詳細的故障排除指南。
