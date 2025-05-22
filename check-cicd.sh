#!/bin/zsh
# 檢查 CI/CD 配置和分支狀態的腳本

# 顏色設置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}=== 檢查 Git 和 CI/CD 配置 ===${NC}"

# 檢查當前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "${BLUE}當前分支: ${GREEN}$CURRENT_BRANCH${NC}"

# 檢查遠端分支
echo "\n${BLUE}遠端分支列表:${NC}"
git remote show origin | grep "tracked" | sed 's/^[[:space:]]*//'

# 檢查最後一次提交
echo "\n${BLUE}最後一次提交:${NC}"
git log -1 --pretty=format:"%h - %s (%cr) <%an>"

# 檢查工作目錄狀態
echo "\n\n${BLUE}工作目錄狀態:${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo "${YELLOW}有未提交的更改:${NC}"
    git status --short
else
    echo "${GREEN}工作目錄清潔${NC}"
fi

# 檢查 GitHub Actions 工作流程文件
echo "\n${BLUE}檢查 GitHub Actions 配置:${NC}"
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "${GREEN}✓ deploy.yml 存在${NC}"
    # 檢查分支配置
    BRANCHES=$(grep "branches:" -A 2 .github/workflows/deploy.yml | grep -v "branches:")
    echo "配置的分支: $BRANCHES"
else
    echo "${RED}✗ deploy.yml 不存在${NC}"
fi

# 提供改進建議
echo "\n${YELLOW}=== 建議操作 ===${NC}"
echo "1. 確保您在正確的分支上工作 (main 或 master)"
echo "2. 如果在其他分支，使用以下命令切換:"
echo "   git checkout main"
echo "3. 確保所有更改都已提交:"
echo "   git add ."
echo "   git commit -m \"your message\""
echo "4. 推送到正確的分支:"
echo "   git push origin main"
echo "5. 檢查 GitHub Actions 是否正確觸發:"
echo "   https://github.com/你的用戶名/nail-it/actions"

# 檢查 Railway CLI 狀態
echo "\n${BLUE}檢查 Railway 配置:${NC}"
if command -v railway &> /dev/null; then
    echo "${GREEN}✓ Railway CLI 已安裝${NC}"
    echo "\n運行以下命令檢查 Railway 狀態:"
    echo "echo \"\$RAILWAY_TOKEN\" | railway login"
    echo "railway status"
else
    echo "${RED}✗ Railway CLI 未安裝${NC}"
    echo "運行以下命令安裝 Railway CLI:"
    echo "npm install -g @railway/cli"
fi
