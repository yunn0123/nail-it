#!/bin/bash
# 本地測試構建腳本
# 這個腳本用來模擬 Railway 的構建過程，以找出潛在問題

# 設定變數
FRONTEND_DIR="./frontend"
DOCKERFILE="${FRONTEND_DIR}/Dockerfile"
IMAGE_NAME="nail-it-frontend-test"

# 顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}開始本地測試構建...${NC}"

# 執行預檢測
echo -e "${YELLOW}執行預檢測...${NC}"
./pre-deploy-check.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}預檢測失敗，終止構建測試${NC}"
    exit 1
fi

# 清理任何舊的測試映像
echo -e "${YELLOW}清理舊的測試映像...${NC}"
docker rmi $IMAGE_NAME 2>/dev/null || true

# 嘗試構建
echo -e "${YELLOW}開始構建測試映像...${NC}"
docker build -t $IMAGE_NAME -f $DOCKERFILE --no-cache $FRONTEND_DIR --build-arg NGINX_CONF_DIR="/etc/nginx/conf.d"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 構建成功!${NC}"
    
    # 嘗試運行
    echo -e "${YELLOW}嘗試運行容器...${NC}"
    CONTAINER_ID=$(docker run -d -p 8080:80 $IMAGE_NAME)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 容器運行成功! 訪問 http://localhost:8080 查看結果${NC}"
        echo -e "${YELLOW}容器 ID: $CONTAINER_ID${NC}"
        echo -e "${YELLOW}使用以下命令停止容器:${NC}"
        echo -e "docker stop $CONTAINER_ID"
    else
        echo -e "${RED}❌ 容器運行失敗${NC}"
    fi
else
    echo -e "${RED}❌ 構建失敗${NC}"
    exit 1
fi

echo -e "${GREEN}測試完成!${NC}"
