#!/bin/zsh
# Railway 卷管理腳本

# 確保設置了 RAILWAY_TOKEN
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "錯誤: RAILWAY_TOKEN 環境變數未設置"
    echo "請設置 RAILWAY_TOKEN 環境變數"
    exit 1
fi

# 列出現有卷
echo "現有 Railway 卷:"
railway volume list

# 創建上傳文件卷（如果不存在）
if ! railway volume list | grep -q "uploads"; then
    echo "創建 uploads 卷..."
    railway volume add uploads --mountPath=/app/uploads
    echo "✅ uploads 卷創建成功"
else
    echo "✅ uploads 卷已存在"
fi

echo "Railway 卷設置完成!"
echo "請記住，在 Railway 中不應使用 Dockerfile 中的 VOLUME 指令，而應使用 Railway 平台的卷功能"
