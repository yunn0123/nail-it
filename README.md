# Milestone 4 文件 README



---

## 專案說明



---

## 研究方法
### User Stories Mapping

### Business Process Modeling Notation (BPMN)
**顧客註冊與登入**
![Customer Register and Login BPMN](assets/BPMN/CustomerReg.png)
以上包含的顧客功能有登入及註冊，而註冊方式又可分為手動註冊及連動外部帳號。目前MVP已開發手動註冊功能。

**美甲師註冊與登入**
![Artist Register and Login BPMN](assets/BPMN/ArtistReg.png)
以上包含的美甲師功能有登入及創建美甲師帳號。對於創建美甲師帳號部分，我們已在MVP實作出輸入資料功能，匯入IG貼文功能則為開發的下一階段。

**顧客美甲師使用系統**
![Interacting with System BPMN](assets/BPMN/EnterSystem.png)
關於顧客，目前系統已開發出的功能如下：
* 查看歷史預約紀錄
* 關鍵字搜尋美甲師
* 標籤搜尋美甲師
* 以圖搜圖搜尋美甲師
* 預約美甲師
* 評分美甲師  

未來針對顧客將會進一步開發貼文互動功能（如貼文、按讚、留言、追蹤等）以及聊聊功能。  

關於美甲師，目前系統已開發出的功能如下：
* 設定可預約時段
* 管理目前預約
* 編輯美甲師個人資料
* 設定美甲師風格標籤

未來針對美甲師將會進一步開發讓美甲師更便於管理（如黑名單、聊聊自動回覆、營運分析）以及貼文的功能。


### Low fidelity Wireframes 或 Figma 介面設計
### EER diagram
### Testing
### Testing (詳細可看部署用[fork repo](https://github.com/yunn0123/nail-it/actions))
* CICD雲端部署
* mock單元測試（僅測試API是否有正確回應）   
---

## 專案原始碼說明及操作方式

### 前端與操作方式
### 後端
對於後端，我們實作了以下功能：  
* 用戶註冊與登入(分美甲師註冊與顧客註冊)  
* 美甲師設定可預約時段  
* 查詢美甲師目前的空檔時段  
* 顧客預約美甲師時段  
* (以圖搜圖跟搜尋) *待編輯*  

詳細後端操作可至`/backend/nail-resv/README.md`閱覽  
連結：https://github.com/Enid1123/nail-it/blob/main/backend/nail-resv/README.md 

---
### 資料庫

---
### 部署
以railway service分別部署前後端，並透過railway後端公開網址連接前後端。

**服務網址**
- 前端應用：[nailed-it](https://nail-it-frontend.up.railway.app)
- 後端 API：[nailed-it-backend](https://nail-it-backend.up.railway.app)

**部署架構**
```
Frontend (Vue)      → Railway Frontend Service

     ↓ API 呼叫

Backend (Next.js)   → Railway Backend Service

     ↓ 資料庫連接

supabase
```

**環境配置**
- **生產環境變數**：已透過 Railway 環境變數設定
- **資料庫**：使用 supabase 服務
- **域名**：使用 Railway 自動生成的 `.railway.app` 域名
- **HTTPS**：Railway 自動提供 SSL 憑證

**部署監控**
- 服務健康狀態可透過 Railway Dashboard 監控
- 自動化部署：推送至 main 分支時自動重新部署
- 日誌查看：可在 Railway 控制台查看即時日誌
