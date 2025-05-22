# Railway 卷管理說明

## 問題：VOLUME 指令在 Railway 中被禁止

Railway 平台不允許在 Dockerfile 中使用 `VOLUME` 指令。當您嘗試部署包含 `VOLUME` 指令的 Docker 映像時，會收到以下錯誤：

```
The `VOLUME` keyword is banned in Dockerfiles. Use Railway volumes instead. https://docs.railway.com/reference/volumes
```

## 原因

Railway 禁用 `VOLUME` 指令是因為：
1. 它希望通過其平台管理持久化存儲
2. 它提供了自己的卷管理系統，與 Docker 卷分離
3. 這樣可以更好地控制數據持久化和安全性

## 解決方案

1. **移除 Dockerfile 中的 VOLUME 指令**

   在我們的專案中，我們已修改 Dockerfile 以防止任何 `VOLUME` 指令：
   - 在前端 Dockerfile 中添加了 `RUN rm -rf /var/cache/nginx` 來清除 nginx 映像中可能定義的卷
   - 在後端 Dockerfile 中使用 `RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads` 創建目錄而不是使用卷

2. **使用 Railway 平台的卷功能**

   Railway 提供了自己的卷管理系統，可以通過 CLI 或 Dashboard 使用：

   ```bash
   # 創建一個掛載在 /app/uploads 的卷
   railway volume add uploads --mountPath=/app/uploads
   ```

3. **使用提供的卷管理腳本**

   我們創建了一個腳本來管理 Railway 卷：
   ```bash
   ./setup-railway-volumes.sh
   ```

## CI/CD 中的卷管理

在 CI/CD 工作流程中，您可以使用以下步驟設置卷：

```yaml
- name: Setup Railway Volumes
  run: |
    # 檢查是否存在 uploads 卷，如果不存在則創建
    if ! railway volume list | grep -q "uploads"; then
      railway volume add uploads --mountPath=/app/uploads
      echo "Created uploads volume"
    fi
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 本地開發

對於本地開發，您可以繼續使用 Docker Compose 中的 volumes 配置，因為這僅影響本地環境，不會干擾 Railway 部署：

```yaml
volumes:
  - ./frontend/src:/app/src:ro  # 只讀掛載源碼以便調試
```

## 參考資料

- [Railway 卷文檔](https://docs.railway.app/reference/volumes)
- [Railway CLI 命令](https://docs.railway.app/develop/cli)
