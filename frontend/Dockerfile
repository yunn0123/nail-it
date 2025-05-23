# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

# 設置鏡像源為國內源，加速構建
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# 先複製 package.json 以利用快取
COPY package*.json ./

# 更健壯的安裝過程 - 檢查 package-lock.json 是否存在，選擇合適的安裝方法
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

# 設置 Git 相關環境變數
ARG GITHUB_SHA
ENV VITE_GIT_COMMIT=${GITHUB_SHA}

# 確保每次構建時使用最新代碼 - 添加緩存破壞參數
ARG BUILD_DATE=unknown
ENV BUILD_DATE=${BUILD_DATE}

# 複製其餘文件
COPY . .
# 如果有任何環境變數設置
RUN if [ -f .env.production ]; then cp .env.production .env; fi
RUN npm run build

# ===== 第二階段：部署靜態檔案 =====
FROM nginx:alpine

# 複製建置完成的檔案到 nginx 的公開資料夾
COPY --from=builder /app/dist /usr/share/nginx/html

# 添加 nginx 配置以支持 SPA 路由
# 使用明確的相對路徑指定源文件
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 設置正確的 MIME 類型 - 避免重複設置
# 檢查 nginx.conf 是否已包含 mime.types
RUN grep -q "mime.types" /etc/nginx/conf.d/default.conf || \
    echo "include /etc/nginx/mime.types;" >> /etc/nginx/conf.d/default.conf

# 清除任何預設的 VOLUME 指令（Railway 不允許 VOLUME）
RUN rm -rf /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]