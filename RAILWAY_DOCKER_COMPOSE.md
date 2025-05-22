# Railway 部署問題解決方案

## 問題：docker-compose.yaml 被當作 Dockerfile 解析

錯誤信息：
```
ERROR: failed to solve: dockerfile parse error on line 1: unknown instruction: services:
```

## 原因

在 `railway.json` 中，`dockerfilePath` 被錯誤地設置為 `./docker-compose.yaml`，但 docker-compose.yaml 不是一個有效的 Dockerfile，所以 Railway 無法解析它。

## 解決方案

1. **更新 railway.json 配置**

   我們已經將 `railway.json` 更改為使用 NIXPACKS 建構器而不是 DOCKERFILE：
   
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "docker-compose build"
     },
     "deploy": {
       "startCommand": "docker-compose up -d",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10,
       "healthcheckPath": "/",
       "healthcheckTimeout": 300
     }
   }
   ```

2. **創建根目錄 Dockerfile**

   為確保 Railway 可以找到 Dockerfile，我們在項目根目錄添加了一個 Dockerfile：
   
   ```dockerfile
   # Railway 部署使用的 Dockerfile
   FROM docker/compose:latest
   
   WORKDIR /app
   
   # 複製 docker-compose 檔案和其他必要檔案
   COPY docker-compose.yaml ./
   COPY ./frontend ./frontend
   COPY ./backend ./backend
   
   # 啟動命令將在 railway.json 中定義
   CMD ["docker-compose", "up", "-d"]
   ```

## Railway 部署最佳實踐

1. **使用正確的構建器**

   Railway 提供幾種構建器選項：
   - `NIXPACKS`：自動檢測並構建應用
   - `DOCKERFILE`：使用 Dockerfile 構建
   - `DOCKER_COMPOSE`：使用 docker-compose.yaml 構建

2. **部署多容器應用**

   對於多容器應用，最好使用 docker-compose：
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "docker-compose build"
     },
     "deploy": {
       "startCommand": "docker-compose up -d"
     }
   }
   ```

3. **使用 Railway 卷而不是 Docker 卷**

   如前所述，Railway 不允許在 Dockerfile 中使用 `VOLUME` 指令。應該使用 Railway 卷：
   ```bash
   railway volume add my-volume --mountPath=/path/in/container
   ```

## 測試部署

部署前，請確保：

1. 構建和啟動命令正確
2. 所有必要的環境變數已設置
3. 卷已正確配置

使用以下命令進行測試：
```bash
railway up
```

## 故障排除

如果仍然遇到問題：

1. 檢查 Railway 日誌：
   ```bash
   railway logs
   ```

2. 嘗試本地構建 Docker 映像：
   ```bash
   docker-compose build
   docker-compose up
   ```

3. 使用 Railway 的調試功能：
   ```bash
   railway debug
   ```
