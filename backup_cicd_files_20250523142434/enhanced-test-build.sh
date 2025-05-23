#!/bin/zsh
# 增強版 Docker 測試構建腳本
# 這個腳本特別設計用來解決網絡問題和文件路徑問題

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定變數
FRONTEND_DIR="./frontend"
DOCKERFILE="${FRONTEND_DIR}/Dockerfile"
IMAGE_NAME="nail-it-frontend-test"
BUILD_DATE=$(date +%Y%m%d%H%M%S)
MAX_RETRIES=3

echo -e "${YELLOW}開始增強版測試構建...${NC}"

# 步驟 1: 檢查文件結構
echo -e "${BLUE}步驟 1: 檢查文件結構${NC}"

# 檢查 Dockerfile 是否存在
if [ ! -f "$DOCKERFILE" ]; then
  echo -e "${RED}❌ 錯誤: Dockerfile 不存在於 $DOCKERFILE${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Dockerfile 存在於 $DOCKERFILE${NC}"
fi

# 檢查 nginx.conf 是否存在
NGINX_CONF="${FRONTEND_DIR}/nginx.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo -e "${RED}❌ 錯誤: nginx.conf 不存在於 $NGINX_CONF${NC}"
  exit 1
else
  echo -e "${GREEN}✅ nginx.conf 存在於 $NGINX_CONF${NC}"
  echo "--- nginx.conf 內容 ---"
  cat "$NGINX_CONF"
  echo "------------------------"
fi

# 步驟 2: 準備構建上下文
echo -e "${BLUE}步驟 2: 準備構建上下文${NC}"

# 確保 nginx.conf 在正確的位置
echo -e "確保 nginx.conf 在構建上下文中..."
cp "$NGINX_CONF" "${FRONTEND_DIR}/nginx.conf"
echo -e "${GREEN}✅ nginx.conf 已複製到構建上下文${NC}"

# 步驟 3: 設置可選的構建加速
echo -e "${BLUE}步驟 3: 設置構建加速${NC}"

# 設置臨時 .npmrc 以使用鏡像
echo -e "設置 npm 鏡像..."
cat > "${FRONTEND_DIR}/.npmrc" << EOF
registry=https://registry.npmmirror.com
disturl=https://npmmirror.com/dist
chromedriver-cdnurl=https://npmmirror.com/mirrors/chromedriver
operadriver-cdnurl=https://npmmirror.com/mirrors/operadriver
phantomjs-cdnurl=https://npmmirror.com/mirrors/phantomjs
sass-binary-site=https://npmmirror.com/mirrors/node-sass
electron-mirror=https://npmmirror.com/mirrors/electron/
EOF
echo -e "${GREEN}✅ 已設置 npm 鏡像${NC}"

# 步驟 4: 使用重試機制進行構建
echo -e "${BLUE}步驟 4: 開始構建 (最多 $MAX_RETRIES 次嘗試)${NC}"

for ((i=1; i<=$MAX_RETRIES; i++)); do
  echo -e "${YELLOW}嘗試 $i/$MAX_RETRIES${NC}"
  
  # 清理舊的測試映像
  docker rmi $IMAGE_NAME 2>/dev/null || true
  
  # 使用更多參數構建 - 添加網絡超時和重試邏輯
  if docker build -t $IMAGE_NAME -f $DOCKERFILE --build-arg BUILD_DATE=$BUILD_DATE --network=host --no-cache $FRONTEND_DIR; then
    echo -e "${GREEN}✅ 構建成功!${NC}"
    
    # 運行測試容器
    echo -e "${YELLOW}嘗試運行容器...${NC}"
    CONTAINER_ID=$(docker run -d -p 8080:80 $IMAGE_NAME)
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ 容器運行成功! 訪問 http://localhost:8080 查看結果${NC}"
      echo -e "${YELLOW}容器 ID: $CONTAINER_ID${NC}"
      echo -e "${YELLOW}使用以下命令停止容器:${NC}"
      echo -e "docker stop $CONTAINER_ID"
      
      # 輸出容器日誌
      echo -e "${YELLOW}容器日誌:${NC}"
      docker logs $CONTAINER_ID
      
      # 清理臨時文件
      rm -f "${FRONTEND_DIR}/.npmrc"
      
      exit 0
    else
      echo -e "${RED}❌ 容器運行失敗${NC}"
    fi
    
    break
  else
    echo -e "${RED}❌ 構建失敗 (嘗試 $i/$MAX_RETRIES)${NC}"
    
    if [ $i -lt $MAX_RETRIES ]; then
      echo -e "${YELLOW}將在 10 秒後重試...${NC}"
      sleep 10
    fi
  fi
done

# 清理臨時文件
rm -f "${FRONTEND_DIR}/.npmrc"

echo -e "${RED}❌ 所有構建嘗試均失敗${NC}"

# 提供一個選項，使用更簡單的替代方法
echo -e "${YELLOW}是否嘗試使用更簡單的 Dockerfile 構建? (y/n)${NC}"
read -k 1 USE_SIMPLE

if [[ $USE_SIMPLE =~ ^[Yy]$ ]]; then
  echo -e "\n${BLUE}創建簡化版 Dockerfile...${NC}"
  
  # 創建簡化版 Dockerfile
  SIMPLE_DOCKERFILE="${FRONTEND_DIR}/Dockerfile.simple"
  cat > "$SIMPLE_DOCKERFILE" << EOF
FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
  
  echo -e "${GREEN}✅ 已創建簡化版 Dockerfile${NC}"
  
  # 檢查是否有預構建的 dist 目錄
  if [ ! -d "${FRONTEND_DIR}/dist" ]; then
    echo -e "${YELLOW}需要先構建前端應用...${NC}"
    
    # 在本地構建前端
    cd "$FRONTEND_DIR"
    npm install
    npm run build
    cd ..
    
    if [ ! -d "${FRONTEND_DIR}/dist" ]; then
      echo -e "${RED}❌ 前端構建失敗${NC}"
      exit 1
    fi
  fi
  
  # 使用簡化版 Dockerfile 構建
  echo -e "${YELLOW}使用簡化版 Dockerfile 構建...${NC}"
  docker build -t "${IMAGE_NAME}-simple" -f "$SIMPLE_DOCKERFILE" "$FRONTEND_DIR"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 簡化版構建成功!${NC}"
    
    # 運行簡化版容器
    CONTAINER_ID=$(docker run -d -p 8080:80 "${IMAGE_NAME}-simple")
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ 簡化版容器運行成功! 訪問 http://localhost:8080 查看結果${NC}"
      echo -e "${YELLOW}容器 ID: $CONTAINER_ID${NC}"
      echo -e "${YELLOW}使用以下命令停止容器:${NC}"
      echo -e "docker stop $CONTAINER_ID"
    else
      echo -e "${RED}❌ 簡化版容器運行失敗${NC}"
    fi
  else
    echo -e "${RED}❌ 簡化版構建失敗${NC}"
  fi
fi

echo -e "${YELLOW}測試完成!${NC}"
