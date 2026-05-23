<template>
  <div class="container">
    <h3>👥 人員管理</h3>
    <el-form :inline="true" @submit.prevent="savePerson">
      <el-input v-model="form.id" placeholder="工號" style="width: 120px" :disabled="isEdit" />
      <el-input v-model="form.name" placeholder="姓名" style="width: 120px" />
      <el-button type="primary" @click="savePerson">{{ isEdit ? '更新' : '新增' }}</el-button>
      <el-button v-if="isEdit" @click="resetForm">取消</el-button>
    </el-form>

    <el-table :data="staffList" stripe border style="margin-top: 20px">
      <el-table-column prop="id" label="工號" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)">編輯</el-button>
          <el-button type="danger" size="small" @click="remove(scope.$index)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const staffList = ref(JSON.parse(localStorage.getItem('pm_staff') || '[]'))
const form = reactive({ id: '', name: '' })
const isEdit = ref(false)

const savePerson = () => {
  if (!form.id || !form.name) return ElMessage.warning('請填寫完整資訊')
  
  if (isEdit.value) {
    // 執行更新
    const index = staffList.value.findIndex(s => s.id === form.id)
    staffList.value[index].name = form.name
    ElMessage.success('已更新')
  } else {
    // 執行新增（檢查重複）
    if (staffList.value.some(s => s.id === form.id)) return ElMessage.error('該工號已存在')
    staffList.value.push({ ...form })
    ElMessage.success('已新增')
  }
  
  localStorage.setItem('pm_staff', JSON.stringify(staffList.value))
  resetForm()
}

const edit = (row) => {
  form.id = row.id
  form.name = row.name
  isEdit.value = true
}

const resetForm = () => {
  form.id = ''; form.name = ''; isEdit.value = false
}

const remove = (i) => { 
  staffList.value.splice(i, 1)
  localStorage.setItem('pm_staff', JSON.stringify(staffList.value)) 
}
</script>
<style scoped>.container { padding: 20px; max-width: 600px; margin: auto; }</style>
