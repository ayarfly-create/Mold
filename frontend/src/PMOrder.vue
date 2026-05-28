<template>
  <div class="container">
    <el-card>
      <template #header><h2>📋 模具保養工單填寫</h2></template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="模具料號">
          <el-select v-model="form.moldId" @change="updateMoldName" style="width: 100%">
            <el-option v-for="m in moldList" :key="m.id" :label="`${m.id}-${m.name}`" :value="m.id" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模塊編號">
          <el-select v-model="form.moduleNo" filterable allow-create placeholder="請選擇或輸入模塊" style="width: 100%">
            <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="本次沖次"><el-input-number v-model="form.shotCount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="開始時間"><el-date-picker v-model="form.startDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" /></el-form-item>
        <el-form-item label="完成時間"><el-date-picker v-model="form.endDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" /></el-form-item>
        <el-form-item label="保養人員">
          <el-select v-model="form.operator" style="width: 100%"><el-option v-for="p in staffList" :key="p.id" :label="p.name" :value="p.name" /></el-select>
        </el-form-item>
        <el-form-item label="保養項目">
          <el-checkbox-group v-model="form.tasks">
            <el-checkbox label="模面清潔" /><el-checkbox label="潤滑作業" /><el-checkbox label="導柱檢查" /><el-checkbox label="水路測試" /><el-checkbox label="備品替換" />
          </el-checkbox-group>
          <el-input v-model="form.customTask" placeholder="其他說明..." style="margin-top: 10px" />
        </el-form-item>
        <el-form-item label="備註"><el-input v-model="form.remarks" type="textarea" /></el-form-item>
        
        <div style="text-align: right"><el-button type="primary" @click="submitForm">確認提交</el-button></div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const moldList = ref(JSON.parse(localStorage.getItem('pm_molds') || '[]'))
const staffList = ref(JSON.parse(localStorage.getItem('pm_staff') || '[]'))
const moduleOptions = ref([])

const form = reactive({ 
    moldId: '', moldName: '', moduleNo: '', shotCount: 0, 
    startDateTime: '', endDateTime: '', operator: '', 
    tasks: [], customTask: '', remarks: '' 
})

// 當模具變更，自動搜尋該模具用過的模塊
watch(() => form.moldId, (newId) => {
  if (!newId) return;
  const history = JSON.parse(localStorage.getItem('pm_history') || '[]')
  moduleOptions.value = [...new Set(history.filter(h => h.moldId === newId).map(h => h.moduleNo))]
})

const updateMoldName = (val) => {
  const m = moldList.value.find(item => item.id === val)
  form.moldName = m ? m.name : ''
}

/**
 * 修正點：全量重新計算
 */
const recalculateMoldStats = () => {
  const history = JSON.parse(localStorage.getItem('pm_history') || '[]');
  const molds = JSON.parse(localStorage.getItem('pm_molds') || '[]');
  molds.forEach(mold => {
    const moldHistory = history.filter(h => h.moldId === mold.id);
    const moduleMap = {};
    moldHistory.forEach(h => {
      if (!moduleMap[h.moduleNo]) moduleMap[h.moduleNo] = 0;
      moduleMap[h.moduleNo] += Number(h.shotCount);
    });
    mold.modules = Object.keys(moduleMap).map(mNo => ({ moduleNo: mNo, shotCount: moduleMap[mNo] }));
    mold.totalShotCount = mold.modules.reduce((sum, m) => sum + m.shotCount, 0);
  });
  localStorage.setItem('pm_molds', JSON.stringify(molds));
};

const submitForm = () => {
    if (!form.moldId || !form.moduleNo || !form.startDateTime || !form.endDateTime) {
        ElMessage.error("請填寫必要資訊"); return;
    }

    const history = JSON.parse(localStorage.getItem('pm_history') || '[]')
    const start = new Date(form.startDateTime);
    const end = new Date(form.endDateTime);
    const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);

    const newRecord = { 
        ...form, 
        formId: `${form.moldId}-${Date.now().toString().slice(-6)}`,
        tasks: [...form.tasks, form.customTask].filter(Boolean).join(', '),
        durationHours
    }

    history.push(newRecord);
    localStorage.setItem('pm_history', JSON.stringify(history));
    
    // 提交後立即同步更新主檔
    recalculateMoldStats();

    ElMessage.success("工單已提交，主檔總沖次已更新");
    // 清空表單
    form.moduleNo = ''; form.shotCount = 0; form.tasks = []; form.customTask = '';
}
</script>
