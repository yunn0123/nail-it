#!/bin/bash

# 設置顏色輸出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Nail-It 自動化部署腳本 ===${NC}"

# 檢查是否在CI環境中運行
IN_CI=${CI:-false}
if [ "$IN_CI" = "true" ]; then
  echo -e "${BLUE}在CI環境中運行${NC}"
fi

# 切換到專案目錄
cd "$(dirname "$0")"

# 獲取 Git 信息
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
PR_NUMBER=${GITHUB_PR_NUMBER:-""}
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# 計算版本標籤
if [ -n "$PR_NUMBER" ]; then
  VERSION_TAG="pr-${PR_NUMBER}-${GIT_COMMIT}-${TIMESTAMP}"
  ENVIRONMENT="preview"
else
  if [ "$GIT_BRANCH" = "main" ] || [ "$GIT_BRANCH" = "master" ]; then
    VERSION_TAG="${GIT_BRANCH}-${GIT_COMMIT}-${TIMESTAMP}"
    ENVIRONMENT="production"
  else
    VERSION_TAG="${GIT_BRANCH}-${GIT_COMMIT}-${TIMESTAMP}"
    ENVIRONMENT="development"
  fi
fi

echo -e "${BLUE}部署信息:${NC}"
echo -e "  ${GREEN}分支:${NC} $GIT_BRANCH"
echo -e "  ${GREEN}Commit:${NC} $GIT_COMMIT"
echo -e "  ${GREEN}PR號:${NC} ${PR_NUMBER:-'無'}"
echo -e "  ${GREEN}版本標籤:${NC} $VERSION_TAG"
echo -e "  ${GREEN}環境:${NC} $ENVIRONMENT"

# 導出環境變量供 docker-compose 使用
export VERSION_TAG
export GITHUB_SHA=$GIT_COMMIT
export ENVIRONMENT

# 構建和推送 Docker 映像
if [ "$IN_CI" = "false" ]; then
  echo -e "${BLUE}本地構建和部署${NC}"
  
  # 檢查是否登錄到 Docker Hub
  if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}警告: 未登錄到 Docker Hub。執行 'docker login' 以推送映像。${NC}"
  fi
  
  # 構建 Docker 映像
  echo -e "${BLUE}構建 Docker 映像...${NC}"
  docker-compose build --no-cache
  
  # 推送映像（如果已登錄）
  if docker info | grep -q "Username"; then
    echo -e "${BLUE}推送 Docker 映像...${NC}"
    docker-compose push
  fi
  
  # 啟動容器
  echo -e "${BLUE}啟動容器...${NC}"
  docker-compose up -d
  
  echo -e "${GREEN}部署完成！服務應該運行在以下地址:${NC}"
  echo -e "  前端: ${GREEN}http://localhost:3000${NC}"
  echo -e "  後端: ${GREEN}http://localhost:5000${NC}"
else
  echo -e "${BLUE}CI環境中構建${NC}"
  # CI環境中，映像構建和部署由 GitHub Actions 處理
fi

# 保存部署記錄
mkdir -p .deployments
echo "$(date): $VERSION_TAG ($ENVIRONMENT)" >> .deployments/history.log
echo "# 最新部署" > .deployments/latest.md
echo "- 時間: $(date)" >> .deployments/latest.md
echo "- 標籤: $VERSION_TAG" >> .deployments/latest.md
echo "- 環境: $ENVIRONMENT" >> .deployments/latest.md
echo "- Git分支: $GIT_BRANCH" >> .deployments/latest.md
echo "- Git提交: $GIT_COMMIT" >> .deployments/latest.md
echo "- PR號: ${PR_NUMBER:-'無'}" >> .deployments/latest.md

echo -e "${GREEN}部署記錄已保存到 .deployments 目錄${NC}"
