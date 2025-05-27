# 使用 Node.js 作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製package.json和package-lock.json（如果存在）
COPY nail-resv/package*.json ./

# 安裝依賴
RUN npm uninstall p-limit || true
RUN npm install
RUN npm install dotenv multer openai p-limit@3.1.0 @supabase/supabase-js --save
# 複製專案文件
COPY nail-resv/ ./

# 設置環境變數
ENV PORT=3000

# 確保不會創建 VOLUME（Railway 不允許使用 VOLUME）
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# 暴露 3000 端口
EXPOSE 3000

# 啟動命令
CMD ["node", "server.js"]
