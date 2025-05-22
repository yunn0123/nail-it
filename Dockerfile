# Railway 部署使用的 Dockerfile
# 這個檔案是為了 Railway 平台而設計的，用於多容器部署

# 使用 docker-compose 來運行多個容器
FROM docker/compose:latest

WORKDIR /app

# 複製 docker-compose 檔案和其他必要檔案
COPY docker-compose.yaml ./
COPY ./frontend ./frontend
COPY ./backend ./backend

# 啟動命令將在 railway.json 中定義
CMD ["docker-compose", "up", "-d"]
