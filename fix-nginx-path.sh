#!/bin/zsh
# 此腳本專門解決 Railway 中 nginx.conf 文件找不到的問題

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}開始修復 nginx.conf 路徑問題...${NC}"

# 步驟 1: 檢查 nginx.conf 是否存在並有正確內容
FRONTEND_DIR="./frontend"
NGINX_CONF="${FRONTEND_DIR}/nginx.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${RED}❌ nginx.conf 不存在於 $NGINX_CONF${NC}"
    echo -e "創建 nginx.conf 文件..."
    
    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # 正確設定 MIME 類型
    include /etc/nginx/mime.types;
    
    # 設定靜態資源的快取控制，但允許更新
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1d;
        add_header Cache-Control "public, max-age=86400, must-revalidate";
        try_files \$uri =404;
    }

    # 處理字體文件
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # 所有請求都導向 index.html 以支援前端路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    echo -e "${GREEN}✅ nginx.conf 文件已創建${NC}"
else
    echo -e "${GREEN}✅ nginx.conf 文件存在${NC}"
    echo "檢查 nginx.conf 內容..."
    cat "$NGINX_CONF"
fi

# 步驟 2: 創建兩個不同版本的 Dockerfile 以確保兼容性
echo -e "\n${BLUE}創建備選版本的 Dockerfile...${NC}"

# 版本 1: 使用絕對路徑拷貝
DOCKERFILE_ABS="${FRONTEND_DIR}/Dockerfile.abs"
cat > "$DOCKERFILE_ABS" << EOF
# 絕對路徑版本 Dockerfile
# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

# 設置鏡像源為國內源，加速構建
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 先複製 package.json 以利用快取
COPY package*.json ./
RUN npm install

# 設置 Git 相關環境變數
ARG GITHUB_SHA
ENV VITE_GIT_COMMIT=\${GITHUB_SHA}

# 確保每次構建時使用最新代碼 - 添加緩存破壞參數
ARG BUILD_DATE=unknown
ENV BUILD_DATE=\${BUILD_DATE}

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
# 使用絕對路徑拷貝
COPY /nginx.conf /etc/nginx/conf.d/default.conf

# 清除任何預設的 VOLUME 指令（Railway 不允許 VOLUME）
RUN rm -rf /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
echo -e "${GREEN}✅ 絕對路徑版本 Dockerfile 已創建: ${DOCKERFILE_ABS}${NC}"

# 版本 2: 創建預構建版本
DOCKERFILE_PREBUILD="${FRONTEND_DIR}/Dockerfile.prebuild"
cat > "$DOCKERFILE_PREBUILD" << EOF
# 預構建版本 Dockerfile - 僅部署階段
FROM nginx:alpine

# 複製預構建的文件 (需要先在本地構建)
COPY ./dist /usr/share/nginx/html

# 直接拷貝 nginx 配置
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 設置 MIME 類型 (如果需要)
RUN echo "include /etc/nginx/mime.types;" >> /etc/nginx/conf.d/default.conf

# 清除 VOLUME 相關
RUN rm -rf /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
echo -e "${GREEN}✅ 預構建版本 Dockerfile 已創建: ${DOCKERFILE_PREBUILD}${NC}"

# 版本 3: 內聯 nginx 配置版本
DOCKERFILE_INLINE="${FRONTEND_DIR}/Dockerfile.inline"
cat > "$DOCKERFILE_INLINE" << EOF
# 內聯 nginx 配置版本 Dockerfile
# ===== 第一階段：建置應用 =====
FROM node:18-alpine AS builder

WORKDIR /app

# 先複製 package.json 以利用快取
COPY package*.json ./
RUN npm install

# 複製其餘文件
COPY . .
# 如果有任何環境變數設置
RUN if [ -f .env.production ]; then cp .env.production .env; fi
RUN npm run build

# ===== 第二階段：部署靜態檔案 =====
FROM nginx:alpine

# 複製建置完成的檔案到 nginx 的公開資料夾
COPY --from=builder /app/dist /usr/share/nginx/html

# 不使用外部 nginx.conf，而是直接生成配置
RUN echo 'server { \\
    listen 80; \\
    server_name _; \\
    root /usr/share/nginx/html; \\
    index index.html; \\
    \\
    # 正確設定 MIME 類型 \\
    include /etc/nginx/mime.types; \\
    \\
    # 設定靜態資源的快取控制 \\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \\
        expires 1d; \\
        add_header Cache-Control "public, max-age=86400, must-revalidate"; \\
        try_files \$uri =404; \\
    } \\
    \\
    # 處理字體文件 \\
    location ~* \\.(woff|woff2|ttf|otf|eot)$ { \\
        expires 30d; \\
        add_header Cache-Control "public, max-age=2592000"; \\
    } \\
    \\
    # 所有請求都導向 index.html 以支援前端路由 \\
    location / { \\
        try_files \$uri \$uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

# 清除任何預設的 VOLUME 指令
RUN rm -rf /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
echo -e "${GREEN}✅ 內聯 nginx 配置版本 Dockerfile 已創建: ${DOCKERFILE_INLINE}${NC}"

# 步驟 3: 更新 railway.json 使用內聯版本
echo -e "\n${BLUE}更新 railway.json 使用內聯版本...${NC}"
RAILWAY_JSON="./railway.json"

# 備份原始文件
cp "$RAILWAY_JSON" "${RAILWAY_JSON}.bak"

# 更新 railway.json
cat > "$RAILWAY_JSON" << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "./frontend/Dockerfile.inline",
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
    "BUILD_DATE": "$(date +%Y%m%d%H%M%S)"
  }
}
EOF
echo -e "${GREEN}✅ railway.json 已更新為使用內聯 nginx 配置版本${NC}"

echo -e "\n${YELLOW}修復完成!${NC}"
echo -e "我們已經:
1. 檢查並確保 nginx.conf 文件存在
2. 創建了三個備選版本的 Dockerfile:
   - ${DOCKERFILE_ABS} (絕對路徑版本)
   - ${DOCKERFILE_PREBUILD} (預構建版本)
   - ${DOCKERFILE_INLINE} (內聯配置版本)
3. 更新了 railway.json 使用內聯版本的 Dockerfile

${YELLOW}建議下一步:${NC}
1. 提交這些變更
2. 重新部署到 Railway
3. 如果仍有問題，可以嘗試使用其他版本的 Dockerfile，只需修改 railway.json 中的 dockerfilePath 即可

${GREEN}原始 Dockerfile 和 railway.json 已備份，可以隨時還原。${NC}"
