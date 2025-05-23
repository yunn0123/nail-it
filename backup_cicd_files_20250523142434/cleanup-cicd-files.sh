#!/bin/zsh
# 整理 CI/CD 相關文件的腳本
# 此腳本會刪除不需要的文件，並整理必要的文件

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}開始整理 CI/CD 相關文件...${NC}"

# 設定工作目錄
WORKSPACE="/Users/yunn/NTU/113-2/SAD/finalProj/fork/nail-it"
cd "$WORKSPACE"

# 步驟 1: 創建備份目錄
echo -e "${BLUE}步驟 1: 創建備份目錄${NC}"
BACKUP_DIR="$WORKSPACE/backup_cicd_files_$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ 備份目錄已創建: $BACKUP_DIR${NC}"

# 步驟 2: 備份並整理 yml 文件
echo -e "${BLUE}步驟 2: 備份並整理 yml 文件${NC}"
# 備份不必要的 yml 文件
if [ -f "temp_deploy.yml" ]; then
  mv "temp_deploy.yml" "$BACKUP_DIR/"
  echo -e "${GREEN}✅ 已移動 temp_deploy.yml 到備份目錄${NC}"
fi

if [ -f "updated_deploy.yml" ]; then
  mv "updated_deploy.yml" "$BACKUP_DIR/"
  echo -e "${GREEN}✅ 已移動 updated_deploy.yml 到備份目錄${NC}"
fi

# 確保主要 CI/CD 文件存在
if [ ! -f ".github/workflows/deploy.yml" ]; then
  echo -e "${RED}❌ 主要的 CI/CD 文件不存在!${NC}"
  if [ -f "$BACKUP_DIR/updated_deploy.yml" ]; then
    mkdir -p ".github/workflows"
    cp "$BACKUP_DIR/updated_deploy.yml" ".github/workflows/deploy.yml"
    echo -e "${GREEN}✅ 已從備份中復制 updated_deploy.yml 到 .github/workflows/deploy.yml${NC}"
  fi
else
  echo -e "${GREEN}✅ 主要 CI/CD 文件 .github/workflows/deploy.yml 已存在${NC}"
fi

# 步驟 3: 備份並整理 sh 文件
echo -e "${BLUE}步驟 3: 備份並整理 sh 文件${NC}"
# 只保留必要的 sh 文件，其餘移動到備份目錄
ESSENTIAL_SH_FILES=("fix-nginx-path.sh")
for sh_file in *.sh; do
  if [[ ! " ${ESSENTIAL_SH_FILES[@]} " =~ " ${sh_file} " ]]; then
    if [ -f "$sh_file" ]; then
      mv "$sh_file" "$BACKUP_DIR/"
      echo -e "${GREEN}✅ 已移動 $sh_file 到備份目錄${NC}"
    fi
  else
    echo -e "${GREEN}✅ 保留必要的 sh 文件: $sh_file${NC}"
  fi
done

# 步驟 4: 整理 Dockerfile 文件
echo -e "${BLUE}步驟 4: 整理 Dockerfile 文件${NC}"
# 在前端目錄中，只保留主要 Dockerfile 和內聯版本，其餘移動到備份目錄
mkdir -p "$BACKUP_DIR/frontend"
if [ -f "frontend/Dockerfile.abs" ]; then
  mv "frontend/Dockerfile.abs" "$BACKUP_DIR/frontend/"
  echo -e "${GREEN}✅ 已移動 frontend/Dockerfile.abs 到備份目錄${NC}"
fi

if [ -f "frontend/Dockerfile.prebuild" ]; then
  mv "frontend/Dockerfile.prebuild" "$BACKUP_DIR/frontend/"
  echo -e "${GREEN}✅ 已移動 frontend/Dockerfile.prebuild 到備份目錄${NC}"
fi

# 確保必要的文件存在
if [ ! -f "frontend/Dockerfile" ]; then
  echo -e "${RED}❌ 前端的主要 Dockerfile 不存在!${NC}"
else
  echo -e "${GREEN}✅ 前端的主要 Dockerfile 已存在${NC}"
fi

if [ ! -f "frontend/Dockerfile.inline" ]; then
  echo -e "${RED}❌ 前端的內聯配置版 Dockerfile 不存在!${NC}"
else
  echo -e "${GREEN}✅ 前端的內聯配置版 Dockerfile 已存在${NC}"
fi

# 步驟 5: 整理文檔文件
echo -e "${BLUE}步驟 5: 整理文檔文件${NC}"
if [ -f "FIX_NGINX_PATH.md" ]; then
  mv "FIX_NGINX_PATH.md" "DEPLOYMENT_GUIDE.md"
  echo -e "${GREEN}✅ 已將 FIX_NGINX_PATH.md 重命名為 DEPLOYMENT_GUIDE.md${NC}"
fi

# 步驟 6: 整理 railway.json 備份
echo -e "${BLUE}步驟 6: 整理 railway.json 備份${NC}"
if [ -f "railway.json.bak" ]; then
  mv "railway.json.bak" "$BACKUP_DIR/"
  echo -e "${GREEN}✅ 已移動 railway.json.bak 到備份目錄${NC}"
fi

echo -e "${GREEN}整理完成!${NC}"
echo -e "所有不必要的文件已移動到備份目錄: $BACKUP_DIR"
echo -e "您可以在確認一切運行正常後刪除備份目錄"
