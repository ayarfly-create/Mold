<template>
  <div class="min-h-screen bg-gray-100 p-8 font-sans">
    <div class="max-w-4xl mx-auto">
      
      <h1 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <el-icon class="mr-2"><Monitor /></el-icon>
        模具保養維護系統 - 現場電子看板
      </h1>

      <el-card shadow="hover" class="mb-6 rounded-lg border-t-4 border-blue-500">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold">{{ dieProject.die_no }}</span>
            <el-tag type="primary" effect="dark">{{ dieProject.project_status }}</el-tag>
          </div>
        </template>
        <div class="grid grid-cols-2 gap-4 text-gray-600">
          <p><strong>模具名稱：</strong> {{ dieProject.die_name }}</p>
          <p><strong>適用機台：</strong> {{ dieProject.target_machine }}</p>
          <p><strong>適用料帶：</strong> {{ dieProject.material_spec }}</p>
          <p><strong>目前累計沖次：</strong> <span class="text-blue-600 font-bold text-lg">{{ dieProject.current_run_count }}</span> 沖</p>
        </div>
      </el-card>

      <el-card shadow="hover" class="rounded-lg">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <el-icon class="mr-2"><Warning /></el-icon>
          關鍵零件狀態：{{ component.component_name }}
        </h2>
        
        <div class="mb-4">
          <div class="flex justify-between mb-1">
            <span class="font-medium text-gray-700">當前沖次 / 保養上限</span>
            <span class="font-medium text-gray-700">{{ component.current_sph }} / {{ component.pm_trigger_sph }}</span>
          </div>
          <el-progress 
            :percentage="progressPercentage" 
            :status="progressStatus"
            :stroke-width="18"
            text-inside
          />
        </div>

        <div class="grid grid-cols-2 gap-4 text-gray-600 mb-6">
            <p><strong>歷史累計研磨量：</strong> {{ component.accumulated_grinding }} mm</p>
            <p><strong>最大研磨極限：</strong> {{ component.max_grinding_limit }} mm</p>
        </div>

        <el-divider content-position="left">現場操作 (手動計數模擬)</el-divider>
        <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
          <span class="font-medium">今日新增沖次：</span>
          <el-input-number v-model="addCountValue" :min="1" :max="500" class="w-32" />
          <el-button type="primary" @click="updateCount" :loading="loading">
            送出更新
          </el-button>
        </div>

        <el-alert v-if="component.status_light === 'YELLOW'" title="【提示保養】請現場備妥 D28 備用公沖，建議下個換料捲時段切入" type="warning" show-icon class="mt-4" />
        <el-alert v-if="component.status_light === 'RED'" title="【強制停機】已達毛邊臨界點，請立刻下線點檢並填寫保養工單！" type="error" show-icon class="mt-4" />

      </el-card>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Monitor, Warning } from '@element-plus/icons-vue';

// 狀態變數
const dieProject = ref({});
const component = ref({});
const addCountValue = ref(50);
const loading = ref(false);

// 模擬從後端獲取資料
const fetchData = async () => {
    // 實務上這裡會呼叫 axios.get('/api/status')
    // 暫時用 mock 資料呈現
    dieProject.value = {
        die_no: "DIE-SUS304-200T",
        die_name: "連續模壓+複合模",
        target_machine: "200 噸沖床",
        material_spec: "卷料 SUS 304 O材 / 板厚 2.5T",
        current_run_count: 550,
        project_status: "生產中"
    };
    component.value = {
        component_name: "D28 公沖",
        pm_trigger_sph: 800,
        current_sph: 550,
        max_grinding_limit: 1.50,
        accumulated_grinding: 0.35,
        status_light: "GREEN"
    };
};

onMounted(() => {
    fetchData();
});

// 計算進度條百分比
const progressPercentage = computed(() => {
    if(!component.value.pm_trigger_sph) return 0;
    const percent = (component.value.current_sph / component.value.pm_trigger_sph) * 100;
    return percent > 100 ? 100 : Math.round(percent);
});

// 計算進度條顏色狀態 (Element Plus 內建)
const progressStatus = computed(() => {
    if (component.value.status_light === 'RED') return 'exception'; // 紅色
    if (component.value.status_light === 'YELLOW') return 'warning'; // 黃色
    return 'success'; // 綠色
});

// 模擬送出更新
const updateCount = () => {
    loading.value = true;
    setTimeout(() => {
        // 模擬後端邏輯更新
        dieProject.value.current_run_count += addCountValue.value;
        component.value.current_sph += addCountValue.value;
        
        // 前端同步更新燈號狀態
        if (component.value.current_sph >= 751) {
            component.value.status_light = "RED";
        } else if (component.value.current_sph >= 601) {
            component.value.status_light = "YELLOW";
        } else {
             component.value.status_light = "GREEN";
        }
        loading.value = false;
        addCountValue.value = 50; // 重置輸入框
    }, 500);
};
</script>

<style scoped>
/* 可加入額外樣式 */
</style>
