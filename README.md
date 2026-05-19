# Mold

die-maintenance-system/
├── frontend/                 # 網頁前端 (建議使用 React 或 Vue)
│   ├── src/
│   │   ├── components/       # 共用元件 (按鈕、輸入框、進度條)
│   │   ├── pages/            # 頁面 (看板、工單、庫存)
│   │   ├── services/         # 呼叫後端 API 的程式碼
│   │   └── App.js            # 前端主程式入口
│   └── package.json
│
├── backend/                  # 後端 API 與伺服器 (建議使用 Node.js/Express 或 Python/FastAPI)
│   ├── controllers/          # 業務邏輯 (如: 處理沖次累加、防呆邏輯)
│   ├── models/               # 資料庫 Schema 定義
│   ├── routes/               # API 路由設定 (如: /api/dies, /api/components)
│   ├── uploads/              # 未來放置模具圖檔(JPG/PDF)的暫存區
│   └── server.js             # 後端主程式入口
│
├── database/                 # 資料庫初始建表 SQL 腳本
│   └── init_schema.sql
│
└── README.md                 # 專案說明與啟動步驟
