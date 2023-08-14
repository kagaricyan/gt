<template>
<div class="na2">
  <div class="chart"></div>
</div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

const option: echarts.EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
    },
  },
  legend: {
    top: '40',
    right: '80',
  },
  grid: {
    top: '100',
    left: '5%',
    right: '5%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    axisLine: {
      show: true,
    },
  },
  yAxis: {
    type: 'category',
    data: [],
  },
  dataset: [
    ['name', '1', '2', '3', '4'],
  ],
  series: [],
};
</script>

<style scoped>

</style>