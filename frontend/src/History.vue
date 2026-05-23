<template>
  <div class="history-container">
    <div class="header">
      <h3>📜 保養歷史紀錄</h3>
      <el-input v-model="search" placeholder="搜尋模具或模塊..." style="width: 250px" prefix-icon="Search" clearable />
    </div>
    <el-table :data="filteredRecords" stripe border style="width: 100%">
      <el-table-column prop="formId" label="工單編號" width="160" />
      <el-table-column prop="date" label="日期" width="110" />
      <el-table-column prop="moldId" label="模具料號" width="100" />
    <el-form-item label="模具料號"><el-input v-model="detailForm.moldId" disabled /></el-form-item>

      <el-table-column prop="moduleNo" label="模塊" width="90" />
      <el-table-column label="保養時間" width="140" align="center">
        <template #default="scope">{{ scope.row.startTime }} ~ {{ scope.row.endTime }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row)">詳情</el-button>
          <el-button type="danger" icon="Delete" circle size="small" @click="deleteRecord(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="📄 工單編輯與詳情" width="500px">
      <el-form :model="detailForm" label-width="100px" :disabled="!isEditing">
        <el-form-item label="工單編號"><el-input v-model="detailForm.formId" disabled /></el-form-item>
        <el-form-item label="模具料號"><el-input v-model="detailForm.moldId" disabled /></el-form-item>
        <el-form-item label="模塊編號"><el-input v-model="detailForm.moduleNo" disabled /></el-form-item>
        <el-form-item label="保養時間">
          <div style="display: flex; gap: 5px;">
            <el-time-picker v-model="detailForm.startTime" format="HH:mm" value-format="HH:mm" style="width: 50%" />
            <el-time-picker v-model="detailForm.endTime" format="HH:mm" value-format="HH:mm" style="width: 50%" />
          </div>
        </el-form-item>
        <el-form-item label="累計沖次"><el-input-number v-model="detailForm.shotCount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="保養人員">
          <el-select v-model="detailForm.operator" style="width: 100%">
            <el-option v-for="p in staffList" :key="p.id" :label="`${p.id}-${p.name}`" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="備註"><el-input v-model="detailForm.remarks" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button v-if="!isEditing" type="primary" @click="isEditing = true">編輯</el-button>
        <template v-else>
          <el-button @click="isEditing = false">取消</el-button>
          <el-button type="success" @click="saveDetail">儲存變更</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
const records = ref([]), staffList = ref([]), search = ref(''), dialogVisible = ref(false), isEditing = ref(false), detailForm = reactive({})
const filteredRecords = computed(() => {
  if (!search.value) return records.value
  const q = search.value.toLowerCase()
  return records.value.filter(i => (i.moldId && i.moldId.toLowerCase().includes(q)) || (i.moduleNo && i.moduleNo.toLowerCase().includes(q)))
})
const viewDetail = (row) => { staffList.value = JSON.parse(localStorage.getItem('pm_staff') || '[]'); Object.assign(detailForm, row); isEditing.value = false; dialogVisible.value = true }
const saveDetail = () => {
  const index = records.value.findIndex(r => r.formId === detailForm.formId)
  if (index !== -1) { records.value[index] = { ...detailForm }; localStorage.setItem('pm_history', JSON.stringify([...records.value].reverse())); ElMessage.success('工單已更新'); isEditing.value = false; dialogVisible.value = false }
}
const loadData = () => { records.value = JSON.parse(localStorage.getItem('pm_history') || '[]').reverse() }
const deleteRecord = (index) => { ElMessageBox.confirm('確定刪除？', '警告', { type: 'warning' }).then(() => { records.value.splice(index, 1); localStorage.setItem('pm_history', JSON.stringify([...records.value].reverse())); loadData(); ElMessage.success('已刪除') }) }
onMounted(loadData)
</script>
<style scoped>.history-container { padding: 20px; max-width: 1000px; margin: auto; } .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }</style>
