#!/bin/zsh
# 解決 Docker 構建問題的腳本

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}開始修復 Docker 構建問題...${NC}"

# 步驟 1: 清理 Docker 緩存
echo -e "${BLUE}步驟 1: 清理 Docker 緩存${NC}"
echo -e "這將刪除未使用的映像、容器和緩存，釋放磁碟空間..."
docker system prune -f
echo -e "${GREEN}✅ Docker 緩存已清理${NC}"

# 步驟 2: 檢查 Docker 守護程序設置
echo -e "${BLUE}步驟 2: 檢查 Docker 守護程序設置${NC}"
echo -e "檢查 Docker 的網絡設置..."

# 創建或更新 Docker 配置以使用鏡像加速器
DOCKER_CONFIG_DIR="$HOME/.docker"
DOCKER_CONFIG_FILE="$DOCKER_CONFIG_DIR/config.json"

if [ ! -d "$DOCKER_CONFIG_DIR" ]; then
  mkdir -p "$DOCKER_CONFIG_DIR"
fi

if [ -f "$DOCKER_CONFIG_FILE" ]; then
  # 檢查是否已有鏡像配置
  if grep -q "registry-mirrors" "$DOCKER_CONFIG_FILE"; then
    echo -e "${GREEN}Docker 已設置鏡像加速器${NC}"
  else
    # 備份現有配置
    cp "$DOCKER_CONFIG_FILE" "${DOCKER_CONFIG_FILE}.bak"
    # 添加鏡像加速器
    cat > "$DOCKER_CONFIG_FILE" << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ],
  $(cat "${DOCKER_CONFIG_FILE}.bak" | grep -v "^{" | grep -v "^}$")
}
EOF
    echo -e "${GREEN}✅ 已添加 Docker 鏡像加速器${NC}"
  fi
else
  # 創建新配置文件
  cat > "$DOCKER_CONFIG_FILE" << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}
EOF
  echo -e "${GREEN}✅ 已創建 Docker 配置並添加鏡像加速器${NC}"
fi

# 步驟 3: 重啟 Docker
echo -e "${BLUE}步驟 3: 重啟 Docker${NC}"
echo -e "重啟 Docker 以應用新設置..."

# 檢測 macOS 版本並使用適當的命令
if [ -x "$(command -v osascript)" ]; then
  # macOS - 使用 AppleScript 重啟 Docker Desktop
  osascript -e 'quit app "Docker"'
  echo "等待 Docker 完全停止..."
  sleep 5
  open -a Docker
  echo "等待 Docker 啟動..."
  
  # 等待 Docker 啟動
  WAIT_TIME=0
  MAX_WAIT=120
  while ! docker info > /dev/null 2>&1; do
    if [ $WAIT_TIME -ge $MAX_WAIT ]; then
      echo -e "${RED}❌ Docker 啟動超時，請手動重啟 Docker Desktop${NC}"
      exit 1
    fi
    echo "等待 Docker 啟動... ($WAIT_TIME 秒)"
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
  done
  
  echo -e "${GREEN}✅ Docker 已重新啟動${NC}"
else
  echo -e "${YELLOW}⚠️ 無法自動重啟 Docker Desktop。請手動重啟 Docker Desktop 應用程序。${NC}"
  echo "重啟後，請按任意鍵繼續..."
  read -k 1
fi

# 步驟 4: 測試 Docker 連接
echo -e "${BLUE}步驟 4: 測試 Docker 連接${NC}"
echo -e "測試是否可以訪問 Docker Hub..."

# 測試 Docker Hub 連接
if docker pull hello-world > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 可以連接到 Docker Hub${NC}"
else
  echo -e "${RED}❌ 無法連接到 Docker Hub${NC}"
  echo -e "請檢查您的網絡設置，並確保可以訪問 docker.io"
  echo -e "您可能需要設置代理或 VPN"
fi

# 步驟 5: 先下載必要的基礎映像
echo -e "${BLUE}步驟 5: 預先拉取必要的基礎映像${NC}"
echo -e "預先下載構建所需的基礎映像，避免構建時網絡問題..."

docker pull node:18-alpine
docker pull nginx:alpine

echo -e "${GREEN}✅ 基礎映像已拉取${NC}"

# 步驟 6: 檢查 nginx.conf 文件
echo -e "${BLUE}步驟 6: 檢查 nginx.conf 文件${NC}"
NGINX_CONF="./frontend/nginx.conf"

if [ -f "$NGINX_CONF" ]; then
  echo -e "${GREEN}✅ nginx.conf 文件存在於 $NGINX_CONF${NC}"
  echo "--- nginx.conf 內容 ---"
  cat "$NGINX_CONF"
  echo "------------------------"
else
  echo -e "${RED}❌ 錯誤: nginx.conf 文件不存在於 $NGINX_CONF${NC}"
  echo -e "創建默認的 nginx.conf 文件..."
  
  # 創建默認的 nginx.conf
  mkdir -p $(dirname "$NGINX_CONF")
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
fi

echo -e "${GREEN}✅ Docker 構建問題修復完成!${NC}"
echo -e "${YELLOW}現在可以嘗試構建 Docker 映像:${NC}"
echo -e "docker build -t nail-it-frontend-test -f ./frontend/Dockerfile ./frontend"
