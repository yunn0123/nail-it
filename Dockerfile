# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ===== 第二階段：部署靜態檔案 =====
FROM nginx:alpine

# 複製建置完成的檔案到 nginx 的公開資料夾
COPY --from=builder /app/dist /usr/share/nginx/html

# 可選：覆蓋 nginx 的預設設定（如果有 routing 需求）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]