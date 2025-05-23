# Railway 部署常見問題與解決方案

## 錯誤：nginx.conf 找不到

如果您遇到類似以下錯誤：

```
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref vutxhi2scj1jbj9au6c2kqbg9::nay35ibbo2kkdmp7pwrifxvdu: "/nginx.conf": not found
```

### 可能的原因

1. **路徑錯誤**：Dockerfile 中的 COPY 指令使用了錯誤的路徑
2. **文件不存在**：nginx.conf 文件不在預期的位置
3. **構建上下文問題**：Docker 構建上下文設置不正確

### 解決方案

1. **檢查 Dockerfile 中的 COPY 指令**

   確保 COPY 指令使用正確的源路徑和目標路徑：
   ```dockerfile
   # 正確
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   # 錯誤
   COPY nginx.conf /nginx/conf.d/default.conf
   ```

2. **確認 nginx.conf 存在**

   確保 nginx.conf 文件存在於前端目錄中：
   ```bash
   ls -la ./frontend/nginx.conf
   ```

3. **構建上下文修復**

   確保 Railway 配置正確設置了構建上下文：
   ```json
   // railway.json
   "build": {
     "builder": "DOCKERFILE",
     "dockerfilePath": "./frontend/Dockerfile",
     "buildArgs": {
       "NGINX_CONF_DIR": "/etc/nginx/conf.d"
     }
   }
   ```

4. **使用預檢測腳本**

   在部署前運行 `pre-deploy-check.sh` 檢查所有必要的文件：
   ```bash
   ./pre-deploy-check.sh
   ```

5. **使用測試構建腳本**

   在本地測試構建過程，找出潛在問題：
   ```bash
   ./test-build.sh
   ```

## Railway 部署最佳實踐

1. **避免使用 VOLUME 指令**

   Railway 不支持 Docker VOLUME 指令，請使用其他方式管理持久化數據。

2. **使用明確的構建參數**

   在 railway.json 中設置明確的構建參數：
   ```json
   "buildArgs": {
     "NGINX_CONF_DIR": "/etc/nginx/conf.d"
   }
   ```

3. **使用健康檢查**

   設置合適的健康檢查路徑和超時時間：
   ```json
   "healthcheckPath": "/",
   "healthcheckTimeout": 300
   ```

4. **保持 Dockerfile 簡潔**

   避免在 Dockerfile 中使用複雜的條件邏輯或變量替換。

## 相關文件

- `pre-deploy-check.sh`：部署前檢查腳本
- `test-build.sh`：本地測試構建腳本
- `railway.json`：Railway 配置文件
