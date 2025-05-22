#!/bin/zsh
# 簡化版的 Railway 認證測試腳本

# 顯示彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Railway CLI 認證測試 ===${NC}"

# 檢查 Railway CLI 是否已安裝
if ! command -v railway &> /dev/null; then
    echo "${RED}Railway CLI 未安裝，請先安裝:${NC}"
    echo "npm install -g @railway/cli"
    exit 1
fi

# 顯示 Railway CLI 版本
echo "${BLUE}Railway CLI 版本:${NC}"
railway --version

# 測試無登入命令的環境變數認證方式
echo "\n${YELLOW}測試方法: 只使用環境變數 (適用於 CI/CD)${NC}"
echo "請輸入您的 Railway 令牌:"
read -s token
export RAILWAY_TOKEN="$token"

# 嘗試執行 Railway 命令
echo "\n${BLUE}正在嘗試使用環境變數認證...${NC}"
if railway whoami &> /dev/null; then
    echo "${GREEN}✓ 認證成功!${NC}"
    echo "您的 Railway 用戶信息:"
    railway whoami
    
    echo "\n${GREEN}✓ 這表示在 CI/CD 環境中，只需設置 RAILWAY_TOKEN 環境變數即可${NC}"
    echo "不需要顯式呼叫 railway login 命令"
else
    echo "${RED}✗ 認證失敗${NC}"
    echo "請檢查令牌是否正確"
fi

# 清理環境變數
unset RAILWAY_TOKEN
echo "\n${BLUE}測試完成，環境變數已清理${NC}"
