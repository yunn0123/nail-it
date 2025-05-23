# Docker 構建與 Railway 部署問題解決方案

## 問題診斷

遇到的主要問題：

1. **網絡連接問題**：
   ```
   failed to do request: Get "https://registry-1.docker.io/...": context canceled: context canceled
   ```

2. **文件路徑問題**：
   ```
   [stage-1 3/5] COPY nginx.conf /nginx/conf.d/default.conf 
   failed to calculate checksum of ref ydhzf1dtmsplkxxh35pkc9fml::i09v34njr4q638tgst3tno3hx: "/nginx.conf": not found
   ```

3. **VOLUME 指令不兼容**：Railway 平台不支持 Docker VOLUME 指令。

## 已實施的解決方案

我們已創建以下工具和修復方案：

### 1. 修復腳本

- **`fix-docker-build.sh`**：修復 Docker 構建問題
- **`fix-railway-deploy.sh`**：修復 Railway 部署問題
- **`enhanced-test-build.sh`**：增強版本地測試構建

### 2. Dockerfile 修改

- 更新了 `COPY` 指令，使用顯式相對路徑：
  ```dockerfile
  # 修改前
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  
  # 修改後
  COPY ./nginx.conf /etc/nginx/conf.d/default.conf
  ```

- 移除了所有 `VOLUME` 相關指令
- 添加了網絡優化和緩存控制

### 3. 備選方案

- **簡化版 Dockerfile**：`frontend/Dockerfile.railway`
- 可在 `railway.json` 中指定使用

## 如何解決 Docker 構建問題

### 網絡問題

1. **清理 Docker 緩存**：
   ```bash
   docker system prune -f
   ```

2. **使用鏡像加速器**：
   ```json
   // ~/.docker/config.json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://registry.docker-cn.com"
     ]
   }
   ```

3. **預先拉取基礎映像**：
   ```bash
   docker pull node:18-alpine
   docker pull nginx:alpine
   ```

### 文件路徑問題

1. **使用顯式相對路徑**：
   ```dockerfile
   COPY ./nginx.conf /etc/nginx/conf.d/default.conf
   ```

2. **確保文件存在**：
   ```bash
   ls -la ./frontend/nginx.conf
   ```

3. **檢查構建上下文**：
   確保 Docker 構建命令中的構建上下文正確。

## 如何解決 Railway 部署問題

### 修復 railway.json

確保 `railway.json` 格式正確，並使用正確的構建配置：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "./frontend/Dockerfile",
    "buildArgs": {
      "NGINX_CONF_DIR": "/etc/nginx/conf.d"
    }
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/",
    "healthcheckTimeout": 300
  },
  "variables": {
    "VERSION_TAG": "railway",
    "ENVIRONMENT": "production",
    "BUILD_DATE": "20250523000000"
  }
}
```

### 使用簡化版 Dockerfile

如果仍然遇到問題，嘗試使用簡化版 Dockerfile：

1. 在本地構建前端應用：
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. 修改 `railway.json` 使用簡化版 Dockerfile：
   ```json
   "dockerfilePath": "./frontend/Dockerfile.railway"
   ```

## 測試部署

1. 運行預檢測腳本：
   ```bash
   ./pre-deploy-check.sh
   ```

2. 測試本地構建：
   ```bash
   ./enhanced-test-build.sh
   ```

3. 修復任何部署問題：
   ```bash
   ./fix-railway-deploy.sh
   ```

## 參考資源

- [Docker for Mac 網絡問題](https://github.com/docker/for-mac/issues/7306)
- [StackOverflow: Docker 緩存計算錯誤](https://stackoverflow.com/questions/66146088/docker-gets-error-failed-to-compute-cache-key-not-found-runs-fine-in-visual)
- [Railway 部署文檔](https://docs.railway.app/deploy/dockerfiles)

## 持續監控

如果問題持續存在，請使用 Railway CLI 進行本地部署測試，或聯繫 Railway 支持。
