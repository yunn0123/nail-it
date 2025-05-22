#!/bin/bash
# 這個腳本用於重建和啟動 Docker 容器，確保使用最新的程式碼

# 設置時間戳和版本標籤
export VERSION_TAG="dev-$(date +%Y%m%d%H%M%S)"
export GITHUB_SHA="local-$(date +%s)"
export ENVIRONMENT="development"

echo "🚀 開始構建和啟動 Docker 容器..."
echo "版本標籤: $VERSION_TAG"

# 強制重建映像，不使用快取
echo "🔨 正在構建映像（不使用快取）..."
docker-compose build --no-cache frontend

# 啟動容器
echo "🌟 正在啟動容器..."
docker-compose up -d frontend

echo "✅ 完成！前端應用現在可以在 http://localhost 訪問"
echo "查看日誌: docker-compose logs -f frontend"
