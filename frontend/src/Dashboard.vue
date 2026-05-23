<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><div>總工單數</div></template>
          <div class="stat-value">{{ history.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><div>警戒中模具</div></template>
          <div class="stat-value" style="color: #f56c6c">{{ alerts.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><div>活躍保養員</div></template>
          <div class="stat-value">{{ topOperator }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="chart-wrapper">
      <h3>📊 各模具最新累積沖次</h3>
      <Bar :data="chartData" :options="{ responsive: true }" />
    </div>

    <el-table :data="healthData" style="margin-top: 20px" border>
      <el-table-column prop="moldId" label="模具編號" />
      <el-table-column label="狀態">
        <template #default="scope">
          <el-tag :type="scope.row.shots > 80000 ? 'danger' : 'success'">
            {{ scope.row.shots > 80000 ? '需保養' : '運作正常' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const history = ref([])
const alerts = ref([])
const topOperator = ref('')
const chartData = ref({ labels: [], datasets: [] })
const healthData = ref([])

onMounted(() => {
  const data = JSON.parse(localStorage.getItem('pm_history') || '[]')
  history.value = data

  // 1. 統計最新沖次 (用於圖表)
  const stats = data.reduce((acc, curr) => {
    acc[curr.moldId] = Math.max(acc[curr.moldId] || 0, Number(curr.shotCount))
    return acc
  }, {})

  chartData.value = {
    labels: Object.keys(stats),
    datasets: [{ label: '累積沖次', data: Object.values(stats), backgroundColor: '#409eff' }]
  }

  // 2. 健康列表
  healthData.value = Object.keys(stats).map(id => ({ moldId: id, shots: stats[id] }))
  alerts.value = healthData.value.filter(i => i.shots > 80000)

  // 3. 找出最常保養的人
  const opCounts = data.reduce((acc, curr) => {
    acc[curr.operator] = (acc[curr.operator] || 0) + 1
    return acc
  }, {})
  topOperator.value = Object.keys(opCounts).sort((a, b) => opCounts[b] - opCounts[a])[0] || '無'
})
</script>

<style scoped>
.dashboard-container { padding: 20px; max-width: 900px; margin: auto; }
.stat-value { font-size: 24px; font-weight: bold; text-align: center; }
.chart-wrapper { margin-top: 30px; background: #fff; padding: 20px; border-radius: 8px; }
</style>
