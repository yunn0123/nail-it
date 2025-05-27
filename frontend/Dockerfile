# ===== 建置階段 =====
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package.json 與 package-lock.json
COPY package*.json ./

# 安裝相依套件
RUN npm install

# 複製其餘的應用程式檔案
COPY . .

# 建置應用程式
RUN npm run build

# ===== 部署階段 =====
FROM nginx:alpine

# 複製建置完成的檔案到 nginx 的公開資料夾
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]