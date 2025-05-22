#!/bin/zsh
# 測試 Railway 專案 ID 連接

# 顯示彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Railway 專案 ID 診斷工具 ===${NC}"

# 檢查 Railway CLI 是否已安裝
if ! command -v railway &> /dev/null; then
    echo "${RED}Railway CLI 未安裝，請先安裝:${NC}"
    echo "npm install -g @railway/cli"
    exit 1
fi

# 顯示 Railway CLI 版本
echo "${BLUE}Railway CLI 版本:${NC}"
railway --version

# 檢查環境變數
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
echo "用戶信息:"
railway whoami

# 列出可用專案
echo "\n${BLUE}列出可用專案:${NC}"
railway project list

# 測試專案 ID
PROJECT_ID="debd9c55-da98-4f2e-9871-197b8b08220d"
echo "\n${BLUE}測試連接專案 ID: ${YELLOW}$PROJECT_ID${NC}"

if railway link -p $PROJECT_ID &> /dev/null; then
    echo "${GREEN}✓ 成功連接到專案 ID: $PROJECT_ID${NC}"
    
    # 顯示專案詳情
    echo "\n專案詳情:"
    railway project
    
    # 列出服務
    echo "\n服務列表:"
    railway service list
else
    echo "${RED}✗ 無法連接到專案 ID: $PROJECT_ID${NC}"
    echo "可能的原因:"
    echo "1. 專案 ID 不正確"
    echo "2. 您的令牌沒有該專案的訪問權限"
    echo "3. 專案不存在或已被刪除"
    
    echo "\n${YELLOW}請嘗試使用上面列出的可用專案 ID${NC}"
fi
