<template>
  <el-container>
    <el-header>
      <el-menu mode="horizontal" :default-active="currentView" @select="handleSelect">
        <el-menu-item index="Dashboard">📊 資訊看板</el-menu-item>
        <el-menu-item index="PMOrder">📋 工單填寫</el-menu-item>
        <el-menu-item index="History">📜 歷史紀錄</el-menu-item>
        <el-menu-item index="Molds">🔧 模具管理</el-menu-item>
        <el-menu-item index="Personnel">👥 人員管理</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <Dashboard v-if="currentView === 'Dashboard'" />
      <PMOrder v-if="currentView === 'PMOrder'" />
      <History v-if="currentView === 'History'" />
      <Molds v-if="currentView === 'Molds'" />
      <Personnel v-if="currentView === 'Personnel'" />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import Dashboard from './Dashboard.vue' // 確保此檔案存在
import PMOrder from './PMOrder.vue'
import History from './History.vue'
import Molds from './Molds.vue'
import Personnel from './Personnel.vue'

const currentView = ref('Dashboard') // 預設顯示看板

const handleSelect = (index) => {
  currentView.value = index
}
</script>

<style>
body { margin: 0; padding: 0; }
</style>
