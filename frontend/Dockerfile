# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

WORKDIR /app

# 先複製 package.json 以利用快取
COPY package*.json ./
RUN npm install

# 設置 Git 相關環境變數（可選）
ARG GITHUB_SHA
ENV VITE_GIT_COMMIT=${GITHUB_SHA}

# 複製其餘文件
COPY . .
# 如果有任何環境變數設置
RUN if [ -f .env.production ]; then cp .env.production .env; fi
# RUN npm run build

# ===== 第二階段：部署靜態檔案 =====
FROM nginx:alpine

# 複製建置完成的檔案到 nginx 的公開資料夾
COPY --from=builder /app/dist /usr/share/nginx/html

# 添加 nginx 配置以支持 SPA 路由
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]