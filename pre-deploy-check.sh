#!/bin/bash
# 預檢測腳本 - 在構建和部署前運行
# 檢查 nginx.conf 存在性並驗證 Dockerfile

# 設定變數
FRONTEND_DIR="./frontend"
NGINX_CONF="${FRONTEND_DIR}/nginx.conf"
DOCKERFILE="${FRONTEND_DIR}/Dockerfile"

# 顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查 nginx.conf 是否存在
echo -e "${YELLOW}正在檢查 nginx.conf 文件...${NC}"
if [ -f "$NGINX_CONF" ]; then
    echo -e "${GREEN}✅ nginx.conf 文件存在於 ${NGINX_CONF}${NC}"
    echo "--- nginx.conf 內容 ---"
    cat "$NGINX_CONF"
    echo "------------------------"
else
    echo -e "${RED}❌ 錯誤: nginx.conf 文件不存在於 ${NGINX_CONF}${NC}"
    exit 1
fi

# 檢查 Dockerfile 中的 COPY 指令
echo -e "${YELLOW}正在檢查 Dockerfile 中的 nginx.conf 路徑...${NC}"
if grep -q "COPY nginx.conf /nginx/conf.d/default.conf" "$DOCKERFILE"; then
    echo -e "${RED}❌ 錯誤: Dockerfile 中使用了錯誤的路徑 '/nginx/conf.d/default.conf'${NC}"
    echo "正在修復 Dockerfile..."
    sed -i 's|COPY nginx.conf /nginx/conf.d/default.conf|COPY nginx.conf /etc/nginx/conf.d/default.conf|g' "$DOCKERFILE"
    echo -e "${GREEN}✅ Dockerfile 已修復${NC}"
elif grep -q "COPY nginx.conf /etc/nginx/conf.d/default.conf" "$DOCKERFILE"; then
    echo -e "${GREEN}✅ Dockerfile 中使用了正確的路徑 '/etc/nginx/conf.d/default.conf'${NC}"
else
    echo -e "${RED}❌ 警告: 在 Dockerfile 中找不到 nginx.conf 的 COPY 指令${NC}"
fi

# 顯示最終的 Dockerfile 內容
echo "--- Dockerfile 相關內容 ---"
grep -A 3 -B 3 "nginx.conf" "$DOCKERFILE" || echo "無法找到 nginx.conf 相關行"
echo "---------------------------"

echo -e "${GREEN}預檢測完成!${NC}"
exit 0
