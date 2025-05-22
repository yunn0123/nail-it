# 使用 Python 3.10 作為基礎映像
FROM python:3.10-slim

# 設定工作目錄
WORKDIR /app

# 設定 Python 環境
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 安裝依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製專案文件
COPY . .

# 暴露 8000 端口
EXPOSE 8000

# 啟動命令 (可根據實際框架調整，這裡假設使用 Django 或 FastAPI)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
# 如果使用 FastAPI，則可能是：
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
