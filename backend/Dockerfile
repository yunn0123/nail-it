# 使用 Python 作為基礎映像，另外安裝 Node.js
# Build on a slim Python image and install Node.js from apt
FROM python:3.11-slim

# Install Node.js (Debian provides Node 18)
RUN apt-get update \
    && apt-get install -y nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 複製package.json和package-lock.json（如果存在）
COPY nail-resv/package*.json ./

# 安裝依賴
RUN npm uninstall p-limit || true
RUN npm install
RUN npm install dotenv multer openai p-limit@3.1.0 @supabase/supabase-js --save

# install Python dependencies for image search utilities
COPY python/requirements.txt ./python/requirements.txt
RUN pip3 install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
    -r python/requirements.txt

# 複製專案文件
COPY nail-resv/ ./
COPY python/ ./python/
COPY models/ ./models/

# 設置環境變數
ENV PORT=3000

# 確保不會創建 VOLUME（Railway 不允許使用 VOLUME）
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# 暴露 3000 端口
EXPOSE 3000

# 啟動命令
CMD ["node", "server.js"]

