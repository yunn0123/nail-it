#!/bin/zsh
# 測試 Railway 令牌有效性

# 彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== Railway 令牌測試工具 ===${NC}"

# 檢查是否提供了令牌
if [ "$#" -ne 1 ]; then
    echo "${YELLOW}請提供要測試的 Railway 令牌${NC}"
    echo "用法: $0 YOUR_TOKEN"
    exit 1
fi

# 保存當前的 RAILWAY_TOKEN (如果有)
OLD_TOKEN=$RAILWAY_TOKEN

# 設置新的令牌
export RAILWAY_TOKEN="$1"

echo "${BLUE}正在使用提供的令牌進行測試...${NC}"

# 測試 whoami
echo "\n${BLUE}1. 測試基本認證 (railway whoami)${NC}"
if railway whoami; then
    echo "${GREEN}✓ 基本認證成功${NC}"
    
    # 檢查是否為專案令牌
    WHOAMI_OUTPUT=$(railway whoami)
    if echo "$WHOAMI_OUTPUT" | grep -q "Project Token"; then
        echo "${GREEN}✓ 使用的是專案令牌${NC}"
        PROJECT_NAME=$(echo "$WHOAMI_OUTPUT" | grep "Project:" | sed 's/Project: //')
        echo "專案名稱: $PROJECT_NAME"
    else
        echo "${RED}✗ 警告! 使用的不是專案令牌${NC}"
        echo "Railway 在 CI/CD 環境中只支持專案令牌"
        echo "請生成新的專案令牌"
    fi
else
    echo "${RED}✗ 基本認證失敗${NC}"
    echo "可能原因:"
    echo "1. 令牌無效或已過期"
    echo "2. 令牌格式不正確"
    echo "3. Railway 服務暫時不可用"
    
    echo "\n嘗試使用 debug 模式獲取更多信息:"
    railway whoami --debug
    
    # 恢復原來的令牌
    export RAILWAY_TOKEN="$OLD_TOKEN"
    exit 1
fi

# 測試 project
echo "\n${BLUE}2. 測試專案訪問 (railway project)${NC}"
if railway project; then
    echo "${GREEN}✓ 專案訪問成功${NC}"
else
    echo "${RED}✗ 專案訪問失敗${NC}"
    echo "可能原因:"
    echo "1. 令牌沒有專案訪問權限"
    echo "2. 專案不存在或已被刪除"
fi

# 測試 service
echo "\n${BLUE}3. 測試服務訪問 (railway service list)${NC}"
if railway service list; then
    echo "${GREEN}✓ 服務訪問成功${NC}"
    
    # 獲取服務 ID
    SERVICE_ID=$(railway service list --json | jq -r '.[0].id')
    if [ ! -z "$SERVICE_ID" ]; then
        echo "找到服務 ID: $SERVICE_ID"
        echo "可以使用此 ID 進行部署: railway up --service=$SERVICE_ID"
        
        # 添加到 GitHub Secrets 的提示
        echo "\n${YELLOW}GitHub Secrets 設置建議:${NC}"
        echo "RAILWAY_TOKEN=$RAILWAY_TOKEN"
        echo "RAILWAY_SERVICE_ID=$SERVICE_ID"
    fi
else
    echo "${RED}✗ 服務訪問失敗${NC}"
    echo "可能原因:"
    echo "1. 令牌沒有服務訪問權限"
    echo "2. 專案中沒有服務"
fi

# 恢復原來的令牌
export RAILWAY_TOKEN="$OLD_TOKEN"

echo "\n${BLUE}測試完成${NC}"
if [ $? -eq 0 ]; then
    echo "${GREEN}令牌有效且具有足夠權限${NC}"
    echo "可以在 CI/CD 環境中使用此令牌"
else
    echo "${RED}令牌測試失敗${NC}"
    echo "請生成新的專案令牌"
fi
