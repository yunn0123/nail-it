# Railway部署專用Dockerfile，用於連接分離的後端服務
# 更新時間：2025-06-08 17:10:00
# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

# 基本環境設置
WORKDIR /app

# 先複製package.json以利用緩存
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有其他檔案
COPY . .

# 構建時接收建置參數並設定環境變數
ARG BACKEND_API_URL
ARG BUILD_VERSION=latest
ENV VITE_BACKEND_API_URL=$BACKEND_API_URL
ENV VITE_BUILD_VERSION=$BUILD_VERSION

# 構建應用
RUN npm run build

# ===== 第二階段：部署前端 =====
FROM nginx:alpine

# 安裝Bash和envsubst工具 - 用於環境變數替換
RUN apk add --no-cache bash gettext

# 複製nginx配置模板
COPY ./nginx.conf /etc/nginx/templates/default.conf.template

# 從建構階段複製構建產物
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製啟動腳本
COPY --chmod=755 ./docker-entrypoint.sh /docker-entrypoint.sh

# 暴露 80 端口
EXPOSE 80

# 執行啟動腳本，處理環境變數並啟動nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]