# Nail-It 自動化部署說明

本文檔說明如何在 Railway 上透過 GitHub 進行自動化部署，並使用 Docker 進行容器化管理。

## 自動化部署流程

整個自動化部署流程如下：

1. 當有新的 PR 提交到 `main` 或 `master` 分支時，GitHub Actions 自動觸發。
2. 構建帶有版本標籤的 Docker 映像並推送到 Docker Hub。
3. 使用 Railway CLI 部署應用程式到 Railway 平台。
4. 對於合併到主分支的 PR，部署到生產環境。
5. 對於開放的 PR，部署到預覽環境。
6. 當 PR 關閉時，自動清理預覽環境。

## 版本標籤系統

每次部署都會生成唯一的版本標籤，格式如下：

- 生產環境：`main-[git_commit]-[timestamp]`
- PR 預覽：`pr-[pr_number]-[git_commit]-[timestamp]`
- 開發環境：`[branch_name]-[git_commit]-[timestamp]`

所有標籤都會保存在 Docker Hub 上，方便回滾到之前的版本。

## 手動部署

如果需要在本地手動部署，可以執行：

```bash
./deploy.sh
```

這將構建 Docker 映像，推送到 Docker Hub，並在本地啟動容器。

## 環境要求

### GitHub Secrets

需要在 GitHub 倉庫中設置以下 Secrets：

- `DOCKER_USERNAME`: Docker Hub 使用者名稱
- `DOCKER_PASSWORD`: Docker Hub 密碼
- `RAILWAY_TOKEN`: Railway API 令牌

### Railway 設置

1. 在 Railway 上創建一個新專案。
2. 連接 GitHub 倉庫。
3. 啟用環境變數：
   - `VERSION_TAG`: 自動由 CI/CD 流程設置
   - `GITHUB_SHA`: Git 提交 SHA
   - `ENVIRONMENT`: 部署環境（production/preview）

## 故障排除

如果部署失敗，請檢查以下事項：

1. GitHub Actions 日誌中的錯誤訊息
2. Docker Hub 上映像是否成功推送
3. Railway 專案日誌

## 目錄結構

```
.
├── .github/workflows/deploy.yml    # GitHub Actions 工作流程
├── docker-compose.yaml             # Docker Compose 配置
├── railway.json                    # Railway 配置
├── deploy.sh                       # 部署腳本
├── .deployments/                   # 部署記錄
│   ├── history.log                 # 部署歷史
│   └── latest.md                   # 最新部署資訊
├── frontend/                       # 前端代碼
│   └── Dockerfile                  # 前端 Docker 配置
└── backend/                        # 後端代碼
    └── Dockerfile                  # 後端 Docker 配置
```

## 版本歷史追蹤

部署記錄會自動保存在 `.deployments` 目錄中，包括：

- 部署時間
- 版本標籤
- 部署環境
- Git 分支和提交
- PR 號（如適用）

這有助於追蹤和審計所有部署活動。
