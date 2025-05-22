# Railway 服務 ID 說明

## 什麼是 RAILWAY_SERVICE_ID

在 Railway 平台中，每個服務（例如前端應用、後端 API、資料庫等）都有一個唯一的識別碼，稱為「服務 ID」（Service ID）。在 CI/CD 工作流程中，我們使用這個 ID 來指定要部署的特定服務。

## 目前的服務 ID

目前，我們的部署工作流程使用以下服務 ID：

```
8539e20b-45a5-4ea3-b253-17a133121025
```

這個 ID 被用於 `railway up --service=ID` 命令中，指示 Railway CLI 將應用部署到特定的服務。

## 如何找到服務 ID

您可以通過以下方式找到您的服務 ID：

1. **Railway 儀表板**：
   - 登入 [Railway 儀表板](https://railway.app/dashboard)
   - 選擇您的專案
   - 點擊要查看的服務
   - 服務 ID 會顯示在 URL 中：`https://railway.app/project/[project-id]/service/[service-id]`

2. **使用 Railway CLI**：
   ```bash
   # 列出所有服務及其 ID
   railway service list --json | jq
   ```

## 將服務 ID 設置為環境變數

為了提高工作流程的可維護性和安全性，建議將服務 ID 設置為 GitHub Secret：

1. 前往專案儲存庫的 Settings 標籤
2. 點擊 Secrets and variables > Actions
3. 點擊 New repository secret
4. 名稱填入 `RAILWAY_SERVICE_ID`
5. 值填入您的服務 ID
6. 點擊 Add secret

設置後，工作流程將自動使用此環境變數，無需修改工作流程文件即可更改部署目標。

## 多環境部署

如果您需要為不同環境（如開發、測試、生產）設置不同的服務 ID，可以：

1. 為每個環境創建單獨的服務 ID 密鑰：
   - `RAILWAY_SERVICE_ID_DEV`
   - `RAILWAY_SERVICE_ID_STAGING`
   - `RAILWAY_SERVICE_ID_PROD`

2. 在工作流程中根據部署環境選擇相應的服務 ID：
   ```yaml
   - name: Deploy to Railway
     run: |
       if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
         RAILWAY_SERVICE_ID=${{ secrets.RAILWAY_SERVICE_ID_PROD }}
       elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
         RAILWAY_SERVICE_ID=${{ secrets.RAILWAY_SERVICE_ID_DEV }}
       else
         RAILWAY_SERVICE_ID=${{ secrets.RAILWAY_SERVICE_ID_STAGING }}
       fi
       
       railway up --service=$RAILWAY_SERVICE_ID --detach
   ```

## 重要提醒

- 服務 ID 是 Railway 專案中的重要識別信息，應妥善保管
- 在 CI/CD 環境中，使用服務 ID 直接部署比使用專案 ID 更加精確和可靠
- 服務 ID 在 Railway 專案中是唯一的，但如果刪除並重新創建服務，ID 會改變
