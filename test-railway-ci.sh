#!/bin/zsh
# Railway CI 環境模擬測試腳本

# 顯示彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Railway CI 環境模擬測試 ===${NC}"

# 檢查是否提供了令牌
if [ "$#" -ne 1 ]; then
    echo "${YELLOW}使用方法: $0 <專案令牌>${NC}"
    echo "例如: $0 project_xxxxxxxxxxxx"
    exit 1
fi

TOKEN=$1

# 備份當前配置
echo "${BLUE}備份當前 Railway 配置...${NC}"
if [ -f ~/.railway/config.json ]; then
    cp ~/.railway/config.json ~/.railway/config.json.bak
    echo "${GREEN}✓ 配置已備份到 ~/.railway/config.json.bak${NC}"
fi

# 設置環境變數
echo "${BLUE}設置環境變數...${NC}"
export RAILWAY_TOKEN="$TOKEN"
export CI=true
echo "${GREEN}✓ 環境變數已設置${NC}"

# 檢查 Railway CLI 版本
echo "${BLUE}Railway CLI 版本:${NC}"
railway --version

# 測試認證
echo "${BLUE}測試 Railway 認證...${NC}"
if railway whoami; then
    echo "${GREEN}✓ 認證成功${NC}"
else
    echo "${RED}✗ 認證失敗${NC}"
    echo "可能的原因:"
    echo "1. 令牌無效或已過期"
    echo "2. 令牌格式不正確"
    echo "3. 令牌不是專案令牌"
    
    # 嘗試用 debug 模式獲取更多信息
    echo "${YELLOW}嘗試使用 debug 模式獲取更多信息...${NC}"
    railway whoami --debug
    
    # 恢復配置
    if [ -f ~/.railway/config.json.bak ]; then
        cp ~/.railway/config.json.bak ~/.railway/config.json
        echo "${BLUE}已恢復原始配置${NC}"
    fi
    
    exit 1
fi

# 檢查服務列表
echo "${BLUE}檢查服務列表...${NC}"
if railway service list; then
    echo "${GREEN}✓ 成功獲取服務列表${NC}"
else
    echo "${RED}✗ 無法獲取服務列表${NC}"
    exit 1
fi

# 獲取服務 ID
echo "${BLUE}請輸入要使用的服務 ID (或按 Enter 從列表中選擇):${NC}"
read SERVICE_ID

if [ -z "$SERVICE_ID" ]; then
    echo "${BLUE}從列表中選擇服務...${NC}"
    SERVICE_ID=$(railway service list --json | jq -r '.[0].id')
    SERVICE_NAME=$(railway service list --json | jq -r '.[0].name')
    echo "選擇了服務: $SERVICE_NAME ($SERVICE_ID)"
fi

# 測試部署命令 (dry run)
echo "${BLUE}測試部署命令 (dry run)...${NC}"
if railway up --service=$SERVICE_ID --detach --dry-run; then
    echo "${GREEN}✓ 部署命令測試成功${NC}"
    echo "${YELLOW}在實際 CI/CD 中使用以下命令:${NC}"
    echo "railway up --service=$SERVICE_ID --detach --force"
else
    echo "${RED}✗ 部署命令測試失敗${NC}"
fi

# 恢復配置
if [ -f ~/.railway/config.json.bak ]; then
    cp ~/.railway/config.json.bak ~/.railway/config.json
    echo "${BLUE}已恢復原始配置${NC}"
fi

echo "${GREEN}測試完成${NC}"
echo "如果測試成功，這表示您的令牌可以在 CI/CD 環境中正常工作"
echo "請更新 GitHub Secrets 中的 RAILWAY_TOKEN 和 RAILWAY_SERVICE_ID"
