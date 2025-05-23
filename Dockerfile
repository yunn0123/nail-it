# Railway 部署使用的 Dockerfile
# 這個檔案是為了 Railway 平台而設計的，用於多容器部署

# 使用 Alpine 作為基礎映像，以減小大小
FROM alpine:latest

# 安裝 Docker 和 Docker Compose
RUN apk add --no-cache docker-cli docker-compose

WORKDIR /app

# 複製 docker-compose 檔案和其他必要檔案
COPY docker-compose.yaml ./
COPY ./frontend ./frontend
COPY ./backend ./backend

# 啟動命令
CMD ["docker-compose", "up"]
