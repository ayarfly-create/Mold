<template>
  <div class="container">
    <h3>📜 保養歷史紀錄</h3>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-input v-model="searchKeyword" placeholder="搜尋工單、模具料號或人員..." clearable />
      </el-col>
    </el-row>

    <el-table :data="filteredList" stripe border style="width: 100%">
      <el-table-column prop="formId" label="工單編號" width="180" sortable />
      <el-table-column prop="moldId" label="模具料號" sortable />
      <el-table-column prop="moduleNo" label="模塊編號" sortable />
      <el-table-column label="耗時" align="center" width="120" sortable :sort-method="(a,b) => (a.durationHours - b.durationHours)">
        <template #default="scope">
          {{ formatDuration(scope.row.startDateTime, scope.row.endDateTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="維護人員" sortable />
      <el-table-column prop="tasks" label="保養項目" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="openDetail(scope.row, scope.$index)">詳情</el-button>
          <el-button link type="danger" size="small" @click="deleteRecord(scope.$index)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? '編輯工單' : '工單詳細資訊'" width="600px">
      <el-descriptions v-if="!isEditMode && editForm.formId" :column="1" border>
        <el-descriptions-item label="工單編號">{{ editForm.formId }}</el-descriptions-item>
        <el-descriptions-item label="模具料號">{{ editForm.moldId }}</el-descriptions-item>
        <el-descriptions-item label="模塊編號">{{ editForm.moduleNo }}</el-descriptions-item>
        <el-descriptions-item label="本次沖次">{{ editForm.shotCount }}</el-descriptions-item>
        <el-descriptions-item label="開始時間">{{ formatDisplayDate(editForm.startDateTime) }}</el-descriptions-item>
        <el-descriptions-item label="完成時間">{{ formatDisplayDate(editForm.endDateTime) }}</el-descriptions-item>
        <el-descriptions-item label="維護人員">{{ editForm.operator }}</el-descriptions-item>
        <el-descriptions-item label="保養項目">{{ editForm.tasks }}</el-descriptions-item>
        <el-descriptions-item label="備註">{{ editForm.remarks || '無' }}</el-descriptions-item>
      </el-descriptions>

      <el-form v-else :model="editForm" label-width="100px">
        <el-form-item label="模塊編號">
          <el-select v-model="editForm.moduleNo" filterable allow-create style="width: 100%">
            <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="本次沖次"><el-input-number v-model="editForm.shotCount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="開始時間">
          <el-date-picker v-model="editForm.startDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="完成時間">
          <el-date-picker v-model="editForm.endDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="維護人員">
          <el-select v-model="editForm.operator" style="width: 100%"><el-option v-for="p in staffList" :key="p.id" :label="p.name" :value="p.name" /></el-select>
        </el-form-item>
        <el-form-item label="保保養項目">
          <el-checkbox-group v-model="editForm.tasksList">
            <el-checkbox label="模面清潔" /><el-checkbox label="潤滑作業" /><el-checkbox label="導柱檢查" /><el-checkbox label="水路測試" /><el-checkbox label="備品替換" />
          </el-checkbox-group>
          <el-input v-model="editForm.customTask" placeholder="其他說明..." />
        </el-form-item>
        <el-form-item label="備註"><el-input v-model="editForm.remarks" type="textarea" /></el-form-item>
      </el-form>

      <template #footer>
        <div v-if="!isEditMode">
          <el-button @click="dialogVisible = false">關閉</el-button>
          <el-button type="primary" @click="isEditMode = true">進入修改模式</el-button>
        </div>
        <div v-else>
          <el-button @click="isEditMode = false">取消</el-button>
          <el-button type="success" @click="saveChanges">確認儲存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const historyList = ref(JSON.parse(localStorage.getItem('pm_history') || '[]'))
const staffList = ref(JSON.parse(localStorage.getItem('pm_staff') || '[]'))
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentIndex = ref(-1)
const moduleOptions = ref([])

const editForm = reactive({
  formId: '', moldId: '', moduleNo: '', shotCount: 0,
  startDateTime: '', endDateTime: '', operator: '', 
  tasksList: [], customTask: '', tasks: '', remarks: ''
})

/**
 * 關鍵修正：同步更新總累計沖次
 * 從歷史紀錄中重新計算主檔所有數據
 */
const recalculateMoldStats = () => {
  const history = JSON.parse(localStorage.getItem('pm_history') || '[]');
  const molds = JSON.parse(localStorage.getItem('pm_molds') || '[]');
  
  molds.forEach(mold => {
    // 1. 篩選該模具的歷史
    const moldHistory = history.filter(h => h.moldId === mold.id);
    
    // 2. 重新計算模塊詳情
    const moduleMap = {};
    moldHistory.forEach(h => {
      if (!moduleMap[h.moduleNo]) moduleMap[h.moduleNo] = 0;
      moduleMap[h.moduleNo] += Number(h.shotCount);
    });
    
    // 3. 轉回陣列格式存入主檔
    mold.modules = Object.keys(moduleMap).map(mNo => ({
      moduleNo: mNo,
      shotCount: moduleMap[mNo]
    }));

    // 4. 計算總累計沖次 (修正點)
    mold.totalShotCount = mold.modules.reduce((sum, m) => sum + m.shotCount, 0);
  });
  
  localStorage.setItem('pm_molds', JSON.stringify(molds));
};

const filteredList = computed(() => {
  const k = searchKeyword.value.toLowerCase()
  return historyList.value.filter(i => i.formId.toLowerCase().includes(k) || i.moldId.toLowerCase().includes(k) || i.operator.toLowerCase().includes(k))
})

const formatDisplayDate = (d) => {
  if(!d) return '-';
  const cleanDate = d.split('.')[0].replace('T', ' '); // 清除 .000Z 與 T
  return cleanDate.replace(/-/g, '/');
}

const formatDuration = (s, e) => {
  const diff = new Date(e).getTime() - new Date(s).getTime()
  if (diff < 0) return '錯誤'
  return `${Math.floor(diff / (1000 * 60 * 60))}時 ${Math.floor((diff / (1000 * 60)) % 60)}分`
}

const openDetail = (row, index) => {
  currentIndex.value = index
  const data = JSON.parse(JSON.stringify(row))
  Object.assign(editForm, data)
  const defaultTasks = ['模面清潔','潤滑作業','導柱檢查','水路測試','備品替換']
  editForm.tasksList = data.tasks ? data.tasks.split(', ').filter(t => defaultTasks.includes(t)) : []
  editForm.customTask = data.tasks ? data.tasks.split(', ').filter(t => !defaultTasks.includes(t)).join(', ') : ''
  
  const history = JSON.parse(localStorage.getItem('pm_history') || '[]')
  moduleOptions.value = [...new Set(history.filter(h => h.moldId === row.moldId).map(h => h.moduleNo).filter(Boolean))]
  
  isEditMode.value = false
  dialogVisible.value = true
}

const saveChanges = () => {
  editForm.tasks = [...editForm.tasksList, editForm.customTask].filter(Boolean).join(', ')
  
  // 計算耗時
  const diff = new Date(editForm.endDateTime).getTime() - new Date(editForm.startDateTime).getTime();
  editForm.durationHours = (diff / (1000 * 60 * 60)).toFixed(1);

  historyList.value[currentIndex.value] = { ...editForm }
  localStorage.setItem('pm_history', JSON.stringify(historyList.value))
  
  recalculateMoldStats() // 執行同步計算
  
  ElMessage.success('修改成功，總沖次已更新')
  dialogVisible.value = false
  isEditMode.value = false
}

const deleteRecord = (index) => {
  ElMessageBox.confirm('確定要刪除這筆紀錄嗎？此操作會同步扣除累積沖次。', '警告').then(() => {
    historyList.value.splice(index, 1)
    localStorage.setItem('pm_history', JSON.stringify(historyList.value))
    
    recalculateMoldStats() // 執行同步計算
    
    ElMessage.success('刪除成功並同步主檔數據')
  })
}
</script>
