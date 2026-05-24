<template>
  <div class="container">
    <h3>🔧 模具基礎資料管理</h3>
    <el-form :inline="true" @submit.prevent="addMold">
      <el-input v-model="newMold.id" placeholder="模具料號" style="width: 150px" />
      <el-input v-model="newMold.name" placeholder="模具名稱" style="width: 150px" />
      <el-button type="primary" @click="addMold">新增模具</el-button>
    </el-form>

    <el-table :data="moldList" stripe border style="margin-top: 20px">
      <el-table-column type="expand">
        <template #default="props">
          <div style="padding: 10px 30px">
            <h4>模塊統計詳情:</h4>
            <el-table :data="props.row.modules" border size="small">
              <el-table-column prop="moduleNo" label="模塊編號" />
              <el-table-column prop="shotCount" label="累計沖次" />
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="料號" />
      <el-table-column prop="name" label="名稱" />
      <el-table-column prop="totalShotCount" label="總累計沖次" sortable />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" size="small" @click="removeMold(scope.$index)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const moldList = ref(JSON.parse(localStorage.getItem('pm_molds') || '[]'))
const newMold = ref({ id: '', name: '' })

const addMold = () => { 
  if(!newMold.value.id) return;
  // 初始化模具結構，包含總沖次與空模塊陣列
  const newEntry = { 
    ...newMold.value, 
    totalShotCount: 0, 
    modules: [] 
  };
  moldList.value.push(newEntry); 
  localStorage.setItem('pm_molds', JSON.stringify(moldList.value)); 
  newMold.value = { id: '', name: '' }
}

const removeMold = (i) => { 
  moldList.value.splice(i, 1); 
  localStorage.setItem('pm_molds', JSON.stringify(moldList.value)) 
}
</script>
