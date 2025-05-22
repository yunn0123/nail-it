# Railway 部署問題解決方案

## 問題描述

1. Railway CLI 登入命令格式變更
2. 在 CI/CD 環境中無法使用互動式登入
3. 部署時出現 "Cannot login in non-interactive mode" 錯誤
4. 舊版命令 `railway login --token $TOKEN` 不再有效

## 解決方案

### 1. 使用環境變數自動認證

最新版本的 Railway CLI 支援通過環境變數進行自動認證，不需要明確的登入命令：

```yaml
- name: Deploy to Railway
  run: |
    # 直接使用環境變數，不需要登入命令
    railway link -p YOUR_PROJECT_ID
    railway up --force
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 2. 管理 Railway 環境變數

Railway 需要幾個關鍵的環境變數來正確部署和區分不同的部署：

- **RAILWAY_TOKEN**: 用於認證（必須）
- **BUILD_DATE**: 確保每次部署都是唯一的
- **VERSION**: 跟踪應用程序版本
- **ENVIRONMENT**: 指示部署環境（例如 production 或 preview）

可以使用腳本管理這些變數：
```bash
./manage-railway-vars.sh
```

### 3. 強制部署

為避免 Railway 跳過部署：

```bash
railway up --force
```

### 4. 每次部署使用唯一的 BUILD_DATE

```bash
railway variables set BUILD_DATE=$(date +%Y%m%d%H%M%S)
```

### 5. 本地測試和診斷

使用提供的診斷腳本測試 Railway 配置：

```bash
./test-railway-auth.sh   # 測試認證
./diagnose-railway.sh    # 診斷部署問題
```

## 最佳實踐

1. **環境變數**：在 CI/CD 環境中，只依賴 `RAILWAY_TOKEN` 環境變數
2. **跳過登入**：不使用任何 `railway login` 命令
3. **強制部署**：使用 `--force` 確保每次都重新部署
4. **唯一標識**：設置 `BUILD_DATE` 環境變數

## CI/CD 配置示例

```yaml
- name: Deploy to Railway
  run: |
    # 直接使用 RAILWAY_TOKEN 環境變數，無需登入
    railway link -p debd9c55-da98-4f2e-9871-197b8b08220d
    
    # 設置環境變數
    railway variables set VERSION=${{ env.VERSION }}
    railway variables set BUILD_DATE=$(date +%Y%m%d%H%M%S)
    
    # 強制部署
    railway up --force
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 問題排查

如果仍然出現問題，請嘗試：

1. **檢查專案 ID 是否正確**
   ```bash
   ./check-project-id.sh
   ```
   確保您使用的專案 ID 是正確的，並且您的 RAILWAY_TOKEN 有權限訪問該專案。

2. 更新 Railway CLI 到最新版本
3. 確認令牌權限和有效性
4. 檢查 Railway 項目配置
5. 使用 `railway whoami` 驗證認證狀態
