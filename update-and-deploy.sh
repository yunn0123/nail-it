#!/bin/zsh
# 這個腳本用於更新代碼並推送到 GitHub，觸發 CI/CD 流程

# 顯示彩色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== 準備更新代碼並部署到 Railway ===${NC}"

# 獲取當前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "${YELLOW}當前分支: ${CURRENT_BRANCH}${NC}"

# 確保工作目錄乾淨
if [ -n "$(git status --porcelain)" ]; then
    echo "${YELLOW}警告: 您有未提交的更改。是否繼續? [y/N]${NC}"
    read answer
    if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
        echo "${YELLOW}操作已取消${NC}"
        exit 1
    fi
fi

# 設置時間戳
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# 添加所有更改
echo "${GREEN}添加所有更改到 Git...${NC}"
git add .

# 提交更改
echo "${GREEN}提交更改...${NC}"
echo "${YELLOW}請輸入提交訊息 (或按 Enter 使用預設訊息):${NC}"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="更新代碼 - 自動部署 ($TIMESTAMP)"
fi

git commit -m "$commit_message"

# 推送到遠端倉庫
echo "${GREEN}推送到 GitHub...${NC}"
git push origin $CURRENT_BRANCH

echo "${BLUE}=== 代碼已推送到 GitHub，CI/CD 流程已觸發 ===${NC}"
echo "${GREEN}您可以在 GitHub Actions 上監控部署狀態${NC}"
echo "${YELLOW}https://github.com/你的用戶名/nail-it/actions${NC}"
