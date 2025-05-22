# Railway CLI 最佳實踐指南

根據 Railway 官方文檔，這是在 CI/CD 環境中使用 Railway CLI 的最佳實踐。

## 官方指南摘要

> Before using the CLI in a non-interactive environment, ensure you have created an access token (only project-tokens are supported as of now) and set it as the RAILWAY_TOKEN environment variable. CI environments are automatically detected by the presence of CI=true variable. In these environments, only build logs will be streamed, and the CLI will exit with an appropriate code indicating success or failure.

## 使用方法

### 選項 1: 使用 Docker 容器 (官方推薦)

```yaml
deploy-job:
  runs-on: ubuntu-latest
  container: ghcr.io/railwayapp/cli:latest
  env:
    SVC_ID: my-service
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  steps:
    - uses: actions/checkout@v3
    - run: railway up --service=${{ env.SVC_ID }}
```

### 選項 2: 使用 npm 安裝 (我們目前的方法)

```yaml
deploy-job:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Install Railway CLI
      run: npm install -g @railway/cli
    - name: Deploy to Railway
      run: |
        export CI=true
        railway up --service=my-service
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 關鍵參數

- `--service=SERVICE_ID` - 指定要部署的服務 ID
- `--detach` - 在後台運行部署
- `CI=true` - 告訴 Railway CLI 這是在 CI/CD 環境中運行

## 服務 ID vs 專案 ID

- **專案 ID** (`railway link -p PROJECT_ID`): 用於連接到特定專案
- **服務 ID** (`railway up --service=SERVICE_ID`): 用於部署特定服務

在 CI/CD 環境中，推薦直接使用服務 ID 部署，而不是先連接專案然後部署。

## 常見問題

1. **找不到服務 ID**
   - 在 Railway 儀表板中找到你的服務
   - 在服務設置或 URL 中可以找到服務 ID

2. **環境變數不起作用**
   - 確保 `RAILWAY_TOKEN` 是有效的 project token
   - 確保設置了 `CI=true` 環境變數

3. **部署被跳過**
   - 使用 `--detach` 選項讓部署在背景運行
   - 在部署後檢查服務狀態
