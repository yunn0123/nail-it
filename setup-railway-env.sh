#!/bin/zsh
# 設置 Railway 環境變數的腳本

# 彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Railway 環境變數設置工具 ===${NC}"

# 檢查 RAILWAY_TOKEN 是否已設置
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "${YELLOW}RAILWAY_TOKEN 環境變數未設置${NC}"
    echo "請輸入您的 Railway 令牌:"
    read -s token
    export RAILWAY_TOKEN="$token"
    echo "已設置 RAILWAY_TOKEN 環境變數"
else
    echo "${GREEN}✓ RAILWAY_TOKEN 環境變數已設置${NC}"
fi

# 測試連接
echo "\n${BLUE}測試 Railway 連接...${NC}"
if ! railway whoami &> /dev/null; then
    echo "${RED}✗ 無法連接到 Railway${NC}"
    echo "請檢查令牌是否有效"
    exit 1
fi

echo "${GREEN}✓ 已成功連接到 Railway${NC}"

# 生成時間戳
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# 設置環境變數
echo "\n${BLUE}設置 Railway 環境變數...${NC}"

echo "設置 VERSION_TAG=production"
railway variables set VERSION_TAG=production

echo "設置 ENVIRONMENT=production"
railway variables set ENVIRONMENT=production

echo "設置 BUILD_DATE=$TIMESTAMP"
railway variables set BUILD_DATE=$TIMESTAMP

echo "\n${GREEN}✓ 環境變數設置完成${NC}"
echo "已設置以下環境變數:"
echo "VERSION_TAG=production"
echo "ENVIRONMENT=production"
echo "BUILD_DATE=$TIMESTAMP"

echo "\n${BLUE}目前的 Railway 環境變數:${NC}"
railway variables list
