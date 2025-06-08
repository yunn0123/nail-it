# Test Deploy Trigger

這個檔案用於測試 GitHub Actions 工作流程是否正確觸發。

修改時間：2025-06-08 17:00:00

## 環境變數設定確認

- BACKEND_API_URL 應該從 GitHub Secrets 中設定
- 建構時會透過 --build-arg 傳遞
- 運行時會透過 railway variables 設定
