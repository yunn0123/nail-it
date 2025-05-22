# 使用 Node.js 作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製package.json和package-lock.json（如果存在）
COPY nail-resv/package*.json ./

# 安裝依賴
RUN npm install

# 複製專案文件
COPY nail-resv/ ./

# 設置環境變數
ENV PORT=5000

# 暴露 5000 端口
EXPOSE 5000

# 啟動命令
CMD ["node", "server.js"]
