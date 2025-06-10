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

---
### 資料庫

---
