<template>
  <div class="container">
    <h3>📜 保養歷史紀錄</h3>
    
    <el-table :data="historyList" stripe border style="width: 100%; margin-top: 20px">
      <el-table-column prop="formId" label="工單編號" width="150" />
      <el-table-column prop="moldId" label="模具料號" />
      <el-table-column prop="moduleNo" label="模塊編號" />
      <el-table-column label="耗時(時：分)" align="center" width="120">
        <template #default="scope">
          {{ formatDuration(scope.row.startDateTime, scope.row.endDateTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="維護人員" />
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
        
        <el-descriptions-item label="耗時">{{ formatDuration(editForm.startDateTime, editForm.endDateTime) }}</el-descriptions-item>
        <el-descriptions-item label="維護人員">{{ editForm.operator }}</el-descriptions-item>
        <el-descriptions-item label="保養項目">{{ editForm.tasks }}</el-descriptions-item>
        <el-descriptions-item label="備註">{{ editForm.remarks || '無' }}</el-descriptions-item>
      </el-descriptions>

      <el-form v-else :model="editForm" label-width="100px">
        <el-form-item label="模塊編號"><el-input v-model="editForm.moduleNo" /></el-form-item>
        <el-form-item label="本次沖次"><el-input-number v-model="editForm.shotCount" :min="0" style="width: 100%" /></el-form-item>
        
        <el-form-item label="開始時間">
          <el-date-picker v-model="editForm.startDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="完成時間">
          <el-date-picker v-model="editForm.endDateTime" type="datetime" format="YYYY/MM/DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="維護人員"><el-input v-model="editForm.operator" /></el-form-item>
        <el-form-item label="保養項目"><el-input v-model="editForm.tasks" /></el-form-item>
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
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const historyList = ref(JSON.parse(localStorage.getItem('pm_history') || '[]'))
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentIndex = ref(-1)

const editForm = reactive({
  formId: '', moldId: '', moduleNo: '', shotCount: 0,
  startDateTime: '', endDateTime: '', operator: '', tasks: '', remarks: ''
})

// 顯示格式化函式：將 "2026-05-24 15:30" 轉換為 "05/24 15:30"
const formatDisplayDate = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  
  // 處理舊資料：如果包含 T 和 Z，先將其轉換為標準日期物件再格式化
  let d;
  if (dateTimeStr.includes('T')) {
    d = new Date(dateTimeStr); // 解析 ISO 格式 (2026-05-22T03:00:24.000Z)
  } else {
    // 處理已經格式化過的資料 (2026-05-24 15:30)
    d = new Date(dateTimeStr.replace(' ', 'T'));
  }

  // 取得月/日 時:分
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  
  return `${month}/${day} ${hour}:${min}`;
};


const formatDuration = (start, end) => {
  if (!start || !end) return '-'
  const diff = new Date(end).getTime() - new Date(start).getTime()
  if (diff < 0) return '時間錯誤'
  const totalMinutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}時 ${minutes}分`
}

const openDetail = (row, index) => {
  currentIndex.value = index
  Object.assign(editForm, JSON.parse(JSON.stringify(row)))
  isEditMode.value = false
  dialogVisible.value = true
}

const saveChanges = () => {
  if (new Date(editForm.startDateTime) > new Date(editForm.endDateTime)) {
    ElMessage.error("完成時間不能早於開始時間")
    return
  }
  historyList.value[currentIndex.value] = { ...editForm }
  localStorage.setItem('pm_history', JSON.stringify(historyList.value))
  ElMessage.success('工單修改成功')
  dialogVisible.value = false
  isEditMode.value = false
}

const deleteRecord = (index) => {
  ElMessageBox.confirm('確定要刪除此紀錄嗎？', '警告', { type: 'warning' }).then(() => {
    historyList.value.splice(index, 1)
    localStorage.setItem('pm_history', JSON.stringify(historyList.value))
    ElMessage.success('刪除成功')
  })
}
</script>

<style scoped>
.container { padding: 20px; }
</style>
