<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
    <div class="max-w-5xl mx-auto space-y-6">
      
      <h1 class="text-3xl font-bold text-gray-800 flex items-center">
        <el-icon class="mr-2"><Monitor /></el-icon>
        模具保養維護系統 - 現場看板 (MVP)
      </h1>

      <el-card shadow="hover" class="rounded-lg border-t-4 border-blue-500">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold">{{ dieProject.die_no }}</span>
            <el-tag :type="projectStatusType" effect="dark">{{ dieProject.project_status }}</el-tag>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>模具名稱：</strong> {{ dieProject.die_name }}</p>
          <p><strong>適用機台：</strong> {{ dieProject.target_machine }}</p>
          <p><strong>適用料帶：</strong> {{ dieProject.material_spec }}</p>
          <p class="flex items-center">
            <strong>目前累計沖次：</strong> 
            <span class="text-blue-600 font-bold text-xl ml-2">{{ dieProject.current_run_count }}</span> 沖
          </p>
          <div class="md:col-span-2">
             <strong>模具總圖：</strong>
             <el-button size="small" type="primary" plain class="ml-2" @click="simulateDownload">
               <el-icon><Document /></el-icon> 查看 2D 組裝圖 (PDF)
             </el-button>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800 flex items-center">
            <el-icon class="mr-2" :class="statusIconColor"><WarningFilled /></el-icon>
            關鍵零件：{{ component.component_name }}
          </h2>
          <el-button type="success" @click="showPMDialog = true" :disabled="component.status_light === 'GREEN'">
            <el-icon class="mr-1"><Tools /></el-icon> 填寫保養工單
          </el-button>
        </div>
        
        <div class="mb-6 bg-gray-50 p-4 rounded-lg border">
          <div class="flex justify-between mb-2">
            <span class="font-medium text-gray-700">當前沖次 / 保養上限</span>
            <span class="font-bold text-gray-800">{{ component.current_sph }} / {{ component.pm_trigger_sph }}</span>
          </div>
          <el-progress 
            :percentage="progressPercentage" 
            :status="progressStatus"
            :stroke-width="20"
            text-inside
          />
          <el-alert v-if="component.status_light === 'YELLOW'" title="【提示保養】請現場備妥 D28 備用公沖，建議下個換料捲時段切入" type="warning" show-icon class="mt-4" :closable="false" />
          <el-alert v-if="component.status_light === 'RED'" title="【強制停機】已達毛邊臨界點，請立刻下線點檢並由品保複核！" type="error" show-icon class="mt-4" :closable="false" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-6">
            <p><strong>歷史累計研磨量：</strong> <span class="text-lg font-bold">{{ component.accumulated_grinding.toFixed(2) }}</span> mm</p>
            <p><strong>最大研磨極限：</strong> {{ component.max_grinding_limit.toFixed(2) }} mm</p>
        </div>

        <el-divider content-position="left">現場生產回報 (MVP 手動計數)</el-divider>
        <div class="flex flex-wrap items-center gap-4">
          <span class="font-medium text-gray-700">本次新增沖次：</span>
          <el-input-number v-model="addCountValue" :min="1" :max="1000" class="w-40" />
          <el-button type="primary" @click="updateCount" :loading="loading">
            送出計數
          </el-button>
        </div>
      </el-card>

    </div>

    <el-dialog v-model="showPMDialog" title="預防保養工單 (含品保確認)" width="90%" max-width="600px" top="5vh">
      <el-form label-position="top">
        
        <div class="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
          <h3 class="font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">👨‍🔧 維修師傅處置</h3>
          
          <el-form-item label="1. 分型面與合模線檢驗">
            <el-checkbox v-model="pmForm.cleanChecked">已確認無卡屑並清潔</el-checkbox>
          </el-form-item>
          
          <el-form-item label="2. 零件圖面輔助">
             <el-button size="small" type="info" plain><el-icon><Picture /></el-icon> 查看 D28 刃口補正圖 (JPG)</el-button>
          </el-form-item>

          <el-form-item label="3. 本次研磨量 (mm)">
            <el-input-number v-model="pmForm.grindingAmount" :min="0" :step="0.01" :precision="2" class="w-full md:w-1/2" />
          </el-form-item>
          
          <div class="p-3 rounded-md" :class="grindingExceedsLimit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'">
            <p class="text-sm">歷史研磨 ({{ component.accumulated_grinding }}) + 本次研磨 ({{ pmForm.grindingAmount }}) = <strong>預計總研磨量: {{ expectedTotalGrinding.toFixed(2) }} mm</strong></p>
            <p v-if="grindingExceedsLimit" class="text-red-600 font-bold mt-1">
              <el-icon><CircleCloseFilled /></el-icon> 已超過極限 {{ component.max_grinding_limit }} mm！強制報廢，請更換新品。
            </el-p>
          </div>
        </div>

        <div class="mb-4 p-4 border border-purple-200 bg-purple-50 rounded-md">
          <h3 class="font-bold text-purple-800 mb-4 border-b border-purple-200 pb-2">🕵️‍♀️ 品保 (QA) 關鍵尺寸檢驗</h3>
          
          <div class="mb-3 text-sm text-purple-700">
            <strong>管制尺寸：</strong> D28 沖頭刃口外徑 <br/>
            <strong>標準值：</strong> {{ qaSpecs.standard.toFixed(3) }} mm (上限: +{{ qaSpecs.upper }}, 下限: {{ qaSpecs.lower }})
          </div>

          <el-form-item label="實測尺寸 (mm)">
            <el-input 
              v-model.number="pmForm.qaMeasured" 
              type="number" 
              placeholder="請輸入千分卡量測數值"
              :class="{'border-red-500': qaValidation === 'FAIL', 'border-green-500': qaValidation === 'PASS'}"
            >
              <template #append>
                <el-tag v-if="qaValidation === 'PASS'" type="success" effect="dark">PASS ✓</el-tag>
                <el-tag v-else-if="qaValidation === 'FAIL'" type="danger" effect="dark">FAIL ❌</el-tag>
                <span v-else>待輸入</span>
              </template>
            </el-input>
          </el-form-item>
          <p v-if="qaValidation === 'FAIL'" class="text-red-500 text-xs mt-1">尺寸超差！不允許上線。</p>
        </div>

      </el-form>
      
      <template #footer>
        <span class="dialog-footer flex justify-end gap-2">
          <el-button @click="showPMDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitPMForm" 
            :disabled="!canSubmitForm"
          >
            品保核准並結案
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { Monitor, WarningFilled, Tools, CircleCloseFilled, Document, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- 模擬資料庫數據 ---
const dieProject = ref({
    die_no: "DIE-SUS304-200T",
    die_name: "連續模壓+複合模",
    target_machine: "200 噸沖床",
    material_spec: "卷料 SUS 304 O材 / 板厚 2.5T",
    current_run_count: 550,
    project_status: "生產中"
});

const component = ref({
    component_name: "D28 公沖",
    pm_trigger_sph: 800,
    current_sph: 550,
    max_grinding_limit: 1.50,
    accumulated_grinding: 0.35,
    status_light: "GREEN" // GREEN, YELLOW, RED
});

// QA 標準規格設定
const qaSpecs = {
    standard: 28.000,
    upper: 0.005,
    lower: -0.010
};

// --- 介面狀態變數 ---
const addCountValue = ref(100);
const loading = ref(false);
const showPMDialog = ref(false);

const pmForm = reactive({
    cleanChecked: false,
    grindingAmount: 0.00,
    qaMeasured: null
});

// --- 計算屬性 (Computed) ---

const projectStatusType = computed(() => {
    if (component.value.status_light === 'RED') return 'danger';
    if (component.value.status_light === 'YELLOW') return 'warning';
    return 'primary';
});

const progressPercentage = computed(() => {
    const percent = (component.value.current_sph / component.value.pm_trigger_sph) * 100;
    return percent > 100 ? 100 : Math.round(percent);
});

const progressStatus = computed(() => {
    if (component.value.status_light === 'RED') return 'exception';
    if (component.value.status_light === 'YELLOW') return 'warning';
    return 'success';
});

const statusIconColor = computed(() => {
    if (component.value.status_light === 'RED') return 'text-red-500';
    if (component.value.status_light === 'YELLOW') return 'text-yellow-500';
    return 'text-green-500';
});

// 防呆計算：預計總研磨量
const expectedTotalGrinding = computed(() => {
    return component.value.accumulated_grinding + (pmForm.grindingAmount || 0);
});

// 防呆判斷：是否超過 1.5mm 極限
const grindingExceedsLimit = computed(() => {
    return expectedTotalGrinding.value > component.value.max_grinding_limit;
});

// 品保 QA 尺寸自動判定邏輯
const qaValidation = computed(() => {
    if (pmForm.qaMeasured === null || pmForm.qaMeasured === '') return 'PENDING';
    const upperLimit = qaSpecs.standard + qaSpecs.upper;
    const lowerLimit = qaSpecs.standard + qaSpecs.lower;
    
    if (pmForm.qaMeasured <= upperLimit && pmForm.qaMeasured >= lowerLimit) {
        return 'PASS';
    } else {
        return 'FAIL';
    }
});

// 表單是否允許送出 (鎖死機制)
const canSubmitForm = computed(() => {
    return pmForm.cleanChecked && 
           !grindingExceedsLimit.value && 
           qaValidation.value === 'PASS';
});


// --- 方法 (Methods) ---

const updateCount = () => {
    loading.value = true;
    setTimeout(() => {
        dieProject.value.current_run_count += addCountValue.value;
        component.value.current_sph += addCountValue.value;
        
        // 防毛邊三段燈號邏輯
        if (component.value.current_sph >= 751) {
            component.value.status_light = "RED";
            dieProject.value.project_status = "強制停機保養";
        } else if (component.value.current_sph >= 601) {
            component.value.status_light = "YELLOW";
            dieProject.value.project_status = "生產中 (留意)";
        } else {
             component.value.status_light = "GREEN";
             dieProject.value.project_status = "生產中";
        }
        loading.value = false;
        ElMessage.success(`已成功記錄，當前沖次為 ${component.value.current_sph}`);
    }, 500);
};

const submitPMForm = () => {
    // 模擬送出工單，重置零件壽命
    component.value.accumulated_grinding = expectedTotalGrinding.value;
    component.value.current_sph = 0;
    component.value.status_light = "GREEN";
    dieProject.value.project_status = "生產中";
    
    // 重置表單
    pmForm.cleanChecked = false;
    pmForm.grindingAmount = 0.00;
    pmForm.qaMeasured = null;
    
    showPMDialog.value = false;
    ElMessage.success("品保簽核完成！零件沖次已歸零，允許重新上線生產。");
};

const simulateDownload = () => {
    ElMessage.info("模擬開啟 /uploads/drawings/DIE-200T-01.pdf");
};
</script>

<style>
/* 若 Tailwind 在 Element Plus 中有被覆蓋，可在這裡調整，目前依賴 Tailwind 的 Utility classes */
</style>
