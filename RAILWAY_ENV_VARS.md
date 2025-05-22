# Railway 環境變數問題解決方案

## 問題：變數插值格式錯誤

錯誤信息：
```
Invalid interpolation format for "frontend" option in service "services": "yunn0123/nail-it-frontend:${VERSION_TAG:-latest}"
```

## 原因

Railway 平台不支援 docker-compose.yaml 中的 shell 風格變數插值（如 `${VARIABLE:-default}`）。這種格式在本地開發時很有用，但在 Railway 上會導致錯誤。

## 解決方案

1. **修改 docker-compose.yaml 檔案**

   我們已經將所有動態變數替換為固定值：
   
   ```yaml
   # 原來的寫法（會導致錯誤）
   image: yunn0123/nail-it-frontend:${VERSION_TAG:-latest}
   
   # 修改後的寫法
   image: yunn0123/nail-it-frontend:latest
   ```

2. **在 Railway 中設置環境變數**

   您可以在 Railway 儀表板中手動設置環境變數：
   
   1. 前往 [Railway 儀表板](https://railway.app/dashboard)
   2. 選擇您的專案
   3. 點擊 "Variables" 標籤
   4. 添加所需的環境變數：
      - `VERSION_TAG`
      - `ENVIRONMENT`
      - `BUILD_DATE`

3. **使用 Railway CLI 設置變數**

   或者，您可以使用 Railway CLI 設置環境變數：
   
   ```bash
   railway variables set VERSION_TAG=production
   railway variables set ENVIRONMENT=production
   railway variables set BUILD_DATE=$(date +%Y%m%d%H%M%S)
   ```

## 本地開發

對於本地開發，您可以繼續使用 .env 檔案和環境變數替換：

1. **創建 .env 檔案**

   ```
   VERSION_TAG=local
   GITHUB_SHA=local
   ENVIRONMENT=development
   BUILD_DATE=20250523000000
   ```

2. **使用 docker-compose 時載入變數**

   ```bash
   docker-compose --env-file .env up
   ```

## 完整部署步驟

1. 確保 docker-compose.yaml 中沒有使用變數插值
2. 在 Railway 中設置必要的環境變數
3. 部署您的應用：
   ```bash
   railway up
   ```

## 其他注意事項

- Railway 平台與本地開發環境有一些差異
- 盡量避免在 docker-compose.yaml 中使用複雜的 shell 表達式
- 考慮為不同環境（開發、測試、生產）創建不同的 docker-compose 檔案
