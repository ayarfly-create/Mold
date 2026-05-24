<template>
  <div class="container">
    <el-card>
      <template #header><h2>📋 模具保養工單</h2></template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="模具料號">
          <el-select v-model="form.moldId" @change="updateMoldName" style="width: 100%">
            <el-option v-for="m in moldList" :key="m.id" :label="`${m.id}-${m.name}`" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="模具名稱"><el-input v-model="form.moldName" disabled /></el-form-item>
        <el-form-item label="模塊編號"><el-input v-model="form.moduleNo" /></el-form-item>
        <el-form-item label="累計沖次"><el-input-number v-model="form.shotCount" style="width: 100%" /></el-form-item>
        <el-form-item label="保養日期"><el-date-picker v-model="form.date" type="date" style="width: 100%" /></el-form-item>
        <el-form-item label="保養時間">
          <div style="display: flex; gap: 10px;">
            <el-time-picker v-model="form.startTime" placeholder="開始" format="HH:mm" value-format="HH:mm" />
            <el-time-picker v-model="form.endTime" placeholder="完成" format="HH:mm" value-format="HH:mm" />
          </div>
        </el-form-item>
        <el-form-item label="保養人員">
          <el-select v-model="form.operator" style="width: 100%">
            <el-option v-for="p in staffList" :key="p.id" :label="`${p.id}-${p.name}`" :value="p.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="保養項目">
          <el-checkbox-group v-model="form.tasks"><el-checkbox label="模面清潔" /><el-checkbox label="潤滑作業" /><el-checkbox label="導柱檢查" /><el-checkbox label="水路測試" /><el-checkbox label="備品替換" /></el-checkbox-group>
          <el-input v-model="form.customTask" placeholder="其他說明..." />
        </el-form-item>
        <el-form-item label="備註"><el-input v-model="form.remarks" type="textarea" /></el-form-item>
        <div style="text-align: right"><el-button type="primary" @click="submitForm">提交工單</el-button></div>
      </el-form>
    </el-card>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
const moldList = ref(JSON.parse(localStorage.getItem('pm_molds') || '[]'))
const staffList = ref(JSON.parse(localStorage.getItem('pm_staff') || '[]'))
const form = reactive({ moldId: '', moldName: '', moduleNo: '', shotCount: 0, date: new Date(), startTime: '', endTime: '', operator: '', tasks: [], customTask: '', remarks: '' })
const updateMoldName = (val) => {
  const m = moldList.value.find(item => item.id === val)
  form.moldName = m ? m.name : ''
}
const submitForm = () => {
    const history = JSON.parse(localStorage.getItem('pm_history') || '[]')
    const now = new Date()
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
    const todayMoldRecords = history.filter(item => item.moldId === form.moldId && item.date === now.toLocaleDateString())
    const sequence = (todayMoldRecords.length + 1).toString().padStart(3, '0')
    const formId = `${form.moldId}-${dateStr}-${sequence}`
    const finalTasks = [...form.tasks, form.customTask].filter(Boolean).join(', ')
    history.push({ ...form, formId, tasks: finalTasks, date: now.toLocaleDateString() })
    localStorage.setItem('pm_history', JSON.stringify(history))
    ElMessage.success(`工單已提交，編號: ${formId}`)
}
</script>
