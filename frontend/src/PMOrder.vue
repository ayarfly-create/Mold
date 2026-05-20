<template>
  <div class="pm-container">
    <h2>📋 預防保養工單 (PM Work Order)</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="模具編號">
        <el-input v-model="form.moldId" placeholder="請輸入模具ID" />
      </el-form-item>
      <el-form-item label="保養項目">
        <el-checkbox-group v-model="form.tasks">
          <el-checkbox label="清潔" />
          <el-checkbox label="潤滑" />
          <el-checkbox label="檢查導柱" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交工單</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
const form = reactive({ moldId: '', tasks: [] })
const submitForm = () => { alert('工單已提交: ' + form.moldId) }
</script>

<style scoped>
.pm-container { padding: 20px; max-width: 600px; margin: auto; }
</style>
