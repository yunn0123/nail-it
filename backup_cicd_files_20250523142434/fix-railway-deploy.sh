#!/bin/zsh
# Railway 部署修復腳本
# 這個腳本用於解決 Railway 部署過程中的常見問題

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}開始修復 Railway 部署問題...${NC}"

# 步驟 1: 檢查 railway.json 格式
echo -e "${BLUE}步驟 1: 檢查 railway.json 格式${NC}"

RAILWAY_JSON="railway.json"
if [ -f "$RAILWAY_JSON" ]; then
  echo -e "驗證 railway.json 格式..."
  if python3 -m json.tool "$RAILWAY_JSON" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ railway.json 格式有效${NC}"
  else
    echo -e "${RED}❌ railway.json 格式無效${NC}"
    echo -e "嘗試修復 railway.json..."
    # 創建有效的 railway.json
    cat > "$RAILWAY_JSON" << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
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
    "BUILD_DATE": "$(date +%Y%m%d%H%M%S)"
  }
}
EOF
    echo -e "${GREEN}✅ railway.json 已修復${NC}"
  fi
else
  echo -e "${RED}❌ railway.json 不存在${NC}"
  echo -e "創建 railway.json..."
  cat > "$RAILWAY_JSON" << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
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
    "BUILD_DATE": "$(date +%Y%m%d%H%M%S)"
  }
}
EOF
  echo -e "${GREEN}✅ railway.json 已創建${NC}"
fi

# 步驟 2: 修復 Dockerfile 中的潛在問題
echo -e "${BLUE}步驟 2: 修復 Dockerfile 中的潛在問題${NC}"

DOCKERFILE="frontend/Dockerfile"
if [ -f "$DOCKERFILE" ]; then
  echo -e "檢查 Dockerfile 中的 COPY nginx.conf 指令..."
  
  # 檢查路徑問題
  if grep -q "COPY nginx.conf /nginx/conf.d/default.conf" "$DOCKERFILE"; then
    echo -e "${RED}❌ 發現錯誤的路徑: /nginx/conf.d/default.conf${NC}"
    echo -e "修復路徑..."
    sed -i '' 's|COPY nginx.conf /nginx/conf.d/default.conf|COPY ./nginx.conf /etc/nginx/conf.d/default.conf|g' "$DOCKERFILE"
    echo -e "${GREEN}✅ 路徑已修復${NC}"
  elif grep -q "COPY nginx.conf /etc/nginx/conf.d/default.conf" "$DOCKERFILE"; then
    echo -e "${YELLOW}檢測到可能的路徑問題，修改為使用顯式路徑...${NC}"
    sed -i '' 's|COPY nginx.conf /etc/nginx/conf.d/default.conf|COPY ./nginx.conf /etc/nginx/conf.d/default.conf|g' "$DOCKERFILE"
    echo -e "${GREEN}✅ 路徑已更新為顯式路徑${NC}"
  fi
  
  # 檢查 VOLUME 指令
  if grep -q "VOLUME" "$DOCKERFILE"; then
    echo -e "${RED}❌ 發現 VOLUME 指令 (Railway 不支持)${NC}"
    echo -e "移除 VOLUME 指令..."
    sed -i '' '/VOLUME/d' "$DOCKERFILE"
    echo -e "${GREEN}✅ VOLUME 指令已移除${NC}"
  fi
else
  echo -e "${RED}❌ Dockerfile 不存在於 $DOCKERFILE${NC}"
fi

# 步驟 3: 確保 nginx.conf 存在
echo -e "${BLUE}步驟 3: 確保 nginx.conf 存在${NC}"

NGINX_CONF="frontend/nginx.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo -e "${RED}❌ nginx.conf 不存在於 $NGINX_CONF${NC}"
  echo -e "創建默認的 nginx.conf..."
  
  # 創建默認的 nginx.conf
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
  echo -e "${GREEN}✅ 已創建默認的 nginx.conf 文件${NC}"
else
  echo -e "${GREEN}✅ nginx.conf 存在於 $NGINX_CONF${NC}"
fi

# 步驟 4: 創建簡化版 Dockerfile 作為後備方案
echo -e "${BLUE}步驟 4: 創建簡化版 Dockerfile 作為後備方案${NC}"

SIMPLE_DOCKERFILE="frontend/Dockerfile.railway"
cat > "$SIMPLE_DOCKERFILE" << EOF
# 簡化版 Dockerfile，專為 Railway 平台優化
FROM nginx:alpine

# 複製預構建的文件
# 注意: 此 Dockerfile 假設已經在本地構建了 dist 目錄
# 如果使用此文件，請先在本地運行 npm run build
COPY ./dist /usr/share/nginx/html

# 明確使用相對路徑複製 nginx 配置
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Railway 不支持 VOLUME，清除相關目錄
RUN rm -rf /var/cache/nginx

# 暴露端口
EXPOSE 80

# 啟動命令
CMD ["nginx", "-g", "daemon off;"]
EOF

echo -e "${GREEN}✅ 已創建簡化版 Dockerfile 作為後備方案${NC}"
echo -e "${YELLOW}如果原始 Dockerfile 仍有問題，可以在 railway.json 中使用此簡化版:${NC}"
echo -e "  \"dockerfilePath\": \"./frontend/Dockerfile.railway\""

# 步驟 5: 創建 Railway 部署說明
echo -e "${BLUE}步驟 5: 創建 Railway 部署說明${NC}"

RAILWAY_GUIDE="RAILWAY_QUICK_FIX.md"
cat > "$RAILWAY_GUIDE" << EOF
# Railway 部署快速修復指南

如果您在 Railway 部署中遇到問題，可以嘗試以下步驟:

## 問題 1: 構建時找不到 nginx.conf

**錯誤訊息**:
\`\`\`
failed to calculate checksum of ref xxx: "/nginx.conf": not found
\`\`\`

**解決方案**:

1. 修改 Dockerfile 中的 COPY 指令，使用顯式相對路徑:
   \`\`\`dockerfile
   # 錯誤
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   # 正確
   COPY ./nginx.conf /etc/nginx/conf.d/default.conf
   \`\`\`

2. 使用簡化版 Dockerfile:
   \`\`\`
   在 railway.json 中將 dockerfilePath 修改為 "./frontend/Dockerfile.railway"
   \`\`\`

## 問題 2: 網絡問題導致無法下載基礎映像

**錯誤訊息**:
\`\`\`
failed to do request: Get "https://registry-1.docker.io/...": context canceled
\`\`\`

**解決方案**:

1. 在 Railway 儀表板中手動觸發部署

2. 如果問題持續存在，請嘗試使用預構建的映像:
   - 在本地構建並推送映像到 Docker Hub
   - 在 Railway 中使用該映像

## 問題 3: VOLUME 指令不被支持

**解決方案**:

移除 Dockerfile 中的所有 VOLUME 指令，並使用 Railway 的持久化儲存服務。

## 後備解決方案

如果以上方法都不起作用，可以:

1. 使用 Railway CLI 在本地進行部署:
   \`\`\`bash
   railway up
   \`\`\`

2. 直接從 GitHub 連接項目，而不使用自定義部署流程

3. 聯繫 Railway 支持
EOF

echo -e "${GREEN}✅ 已創建 Railway 部署快速修復指南${NC}"

echo -e "${YELLOW}修復步驟完成!${NC}"
echo -e "${YELLOW}如果仍有問題，請查看 $RAILWAY_GUIDE 獲取更多解決方案${NC}"
echo -e "${GREEN}您現在可以嘗試重新部署到 Railway${NC}"
