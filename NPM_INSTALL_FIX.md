# 解決 npm install 在 Docker 構建中的問題

## 問題描述

在 Docker 構建過程中遇到以下錯誤：

```
ERROR: failed to solve: process "/bin/sh -c npm install" did not complete successfully: exit code: 254
```

以及 npm ci 的錯誤：

```
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
npm error later to generate a package-lock.json file, then try again.
```

## 已實施的解決方案

我們對 Dockerfile 進行了以下修改：

1. **添加了 npm 鏡像設定**：
   ```dockerfile
   ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
   ```

2. **增加 Node.js 記憶體限制**：
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=4096"
   ```

3. **實施智能檢測**：檢查 package-lock.json 是否存在，選擇適當的安裝方法：
   ```dockerfile
   RUN if [ -f package-lock.json ]; then \
         echo "Found package-lock.json, using npm ci..." && \
         npm config set fetch-retries 5 && \
         npm config set fetch-retry-mintimeout 20000 && \
         npm config set fetch-retry-maxtimeout 120000 && \
         npm ci --quiet; \
       else \
         echo "No package-lock.json found, using npm install..." && \
         npm config set fetch-retries 5 && \
         npm config set fetch-retry-mintimeout 20000 && \
         npm config set fetch-retry-maxtimeout 120000 && \
         npm install --quiet; \
       fi
   ```

4. **修正 Railway 配置中的構建上下文**：
   ```json
   "build": {
     "builder": "DOCKERFILE",
     "dockerfilePath": "./frontend/Dockerfile.inline",
     "buildArgs": {
       "NGINX_CONF_DIR": "/etc/nginx/conf.d"
     },
     "root": "./frontend"
   }
   ```

## 為什麼這些修改有效

1. **npm 鏡像**：使用鏡像可以加速包下載，減少網絡超時的可能性。

2. **記憶體限制**：增加 Node.js 可用記憶體，避免在安裝大型依賴時出現記憶體不足的問題。

3. **智能檢測安裝方法**：自動檢測是否存在 package-lock.json，選擇最合適的安裝命令，避免 npm ci 失敗。

4. **重試設定**：在網絡不穩定的情況下，增加重試次數和超時時間可以提高成功率。

5. **修正構建上下文**：確保 Docker 構建在正確的目錄中進行，能夠找到所有必要的文件。

## 其他可能的解決方案

如果上述修改仍然無法解決問題，可以考慮：

1. **使用 yarn 代替 npm**：
   ```dockerfile
   RUN npm install -g yarn && yarn install --frozen-lockfile
   ```

2. **使用多階段構建**：在本地預先構建好前端應用，然後只部署構建結果。

3. **使用 Docker 構建緩存**：確保使用 Docker 的緩存機制，減少重複構建的次數。

## 測試部署

修改後，可以通過以下命令測試構建：

```bash
docker build -t nail-it-frontend-test -f ./frontend/Dockerfile.inline ./frontend
```

然後在 Railway 上部署：

```bash
railway up
```
