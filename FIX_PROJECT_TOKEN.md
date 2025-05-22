# 解決 "Project Token not found" 錯誤

## 問題描述

在使用 Railway CLI 部署時，出現 "Project Token not found" 錯誤，表示 Railway CLI 無法使用提供的 `RAILWAY_TOKEN` 環境變數進行身份驗證。

## 解決方案

### 1. 生成新的專案令牌

Railway 專案令牌是與特定專案關聯的訪問令牌，需要在 Railway 儀表板中生成：

1. 登錄 [Railway 儀表板](https://railway.app/dashboard)
2. 選擇您的專案
3. 點擊 "Settings" 標籤
4. 找到 "Project Tokens" 部分
5. 點擊 "New Token" 創建新的專案令牌
6. 為令牌命名（例如 "CI/CD Token"）並選擇適當的權限（至少需要讀/寫權限）
7. 複製生成的令牌

### 2. 更新 GitHub Secrets

更新 GitHub 儲存庫中的 `RAILWAY_TOKEN` secret：

1. 前往 GitHub 儲存庫的 "Settings" 標籤
2. 點擊 "Secrets and variables" -> "Actions"
3. 找到 `RAILWAY_TOKEN` 並點擊 "Update"
4. 粘貼新生成的專案令牌並保存

### 3. 測試令牌

使用提供的測試腳本驗證令牌是否有效：

```bash
export RAILWAY_TOKEN="your-new-token"
./test-railway-auth.sh
```

## 注意事項

1. **專案令牌 vs. 個人訪問令牌**：Railway 在 CI/CD 環境中只支持專案令牌（Project Token），而不是個人訪問令牌。

2. **令牌權限**：確保令牌有足夠的權限來執行部署操作。

3. **令牌有效期**：專案令牌可能有過期時間，請確保定期更新。

4. **環境變數設置**：在 CI/CD 環境中，需要將 `CI=true` 與令牌一起使用：

```yaml
env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  CI: true
```

## 重要參考

- [Railway CLI 官方文檔](https://docs.railway.app/develop/cli)
- [Railway CI/CD 最佳實踐](RAILWAY_BEST_PRACTICES.md)
- [Railway 部署問題解決方案](RAILWAY_SOLUTION.md)
