const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// 模擬資料庫：模具專案母表與 D28 零件履歷
const mockData = {
    die_project: {
        die_project_id: "PROJECT-DIE-200T-01",
        die_no: "DIE-SUS304-200T",
        die_name: "連續模壓+複合模",
        target_machine: "200 噸沖床",
        material_spec: "卷料 SUS 304 O材 / 板厚 2.5T",
        current_run_count: 550, // 目前沖次
        project_status: "生產中"
    },
    component: {
        component_id: "COMP-D28-001",
        component_name: "D28 公沖",
        pm_trigger_sph: 800,
        current_sph: 550, // 需與母表同步更新
        max_grinding_limit: 1.50,
        accumulated_grinding: 0.35,
        status_light: "GREEN" // GREEN, YELLOW, RED
    }
};

// API: 取得目前模具與零件狀態
app.get('/api/status', (req, res) => {
    res.json(mockData);
});

// API: 手動更新沖次 (MVP 階段)
app.post('/api/update-sph', (req, res) => {
    const { addCount } = req.body;
    
    // 更新沖次
    mockData.die_project.current_run_count += addCount;
    mockData.component.current_sph += addCount;

    // 簡單的防毛邊三色燈號邏輯判斷
    const current = mockData.component.current_sph;
    if (current >= 751) {
        mockData.component.status_light = "RED"; // 強制停機
    } else if (current >= 601) {
        mockData.component.status_light = "YELLOW"; // 保養預告
    } else {
         mockData.component.status_light = "GREEN";
    }

    res.json({ success: true, currentData: mockData });
});

app.listen(port, () => {
    console.log(`模具保養系統後端啟動於 http://localhost:${port}`);
});
