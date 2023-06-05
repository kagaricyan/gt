<template>
  <div class="guild-total-damage-tendency" ref="chartDom"></div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import * as echarts from 'echarts';
import attackRecords from '../../../assets/data/index';

const totalDamage = attackRecords.map(i => {
  return {
    name: i.name,
    value: i.data.reduce((a, c) => a + c.damage, 0),
  };
});
const options: echarts.EChartsOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      // Use axis to trigger tooltip
      type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
    },
  },
  xAxis: {
    type: 'category',
    axisLine: {
      show: true,
    },
    data: totalDamage.map(i => i.name),
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: true,
    },
    axisLabel: {
      show: true,
      formatter(res: number) {
        return String((Number(res)/100000000).toFixed(0))+'e';
      },
    },
  },
  series: [
    {
      data: totalDamage.map(i => i.value),
      type: 'line',
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value)/100000000).toFixed(2))+'e';
        },
      }
    },
  ],
};

const chartDom = ref<HTMLElement>();
let chart: echarts.EChartsType;
const init = () => {
  chart = echarts.init(chartDom.value!);
  chart.setOption(options);
};

onMounted(() => {
  init();
});
</script>


<style scoped>
.guild-total-damage-tendency {
  height: 600px;
}
</style>