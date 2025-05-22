#!/bin/zsh
# 這個腳本用來測試 Railway CLI 的不同登入方法

echo "測試 Railway CLI 登入方法..."

# 確保 Railway CLI 已安裝
if ! command -v railway &> /dev/null; then
    echo "Railway CLI 未安裝，正在安裝..."
    npm install -g @railway/cli
fi

echo "Railway CLI 版本:"
railway --version

echo "\n嘗試方法 1: 使用 --browserless 選項"
echo "export RAILWAY_TOKEN=\"你的token\""
echo "railway login --browserless"

echo "\n嘗試方法 2: 直接登入 (互動式)"
echo "railway login"

echo "\n嘗試方法 3: 嘗試設置環境變數後不使用登入命令"
echo "export RAILWAY_TOKEN=\"你的token\""
echo "railway whoami"

echo "\n請選擇一個方法進行測試 (1/2/3):"
read method

case $method in
    1)
        echo "請輸入您的 Railway 令牌:"
        read -s token
        export RAILWAY_TOKEN="$token"
        railway login --browserless
        ;;
    2)
        railway login
        ;;
    3)
        echo "請輸入您的 Railway 令牌:"
        read -s token
        export RAILWAY_TOKEN="$token"
        railway whoami
        ;;
    *)
        echo "無效的選項"
        ;;
esac

# 測試是否成功登入
if railway whoami &> /dev/null; then
    echo "\n登入成功!"
    railway whoami
else
    echo "\n登入失敗!"
fi
