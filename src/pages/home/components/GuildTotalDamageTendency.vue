<template>
  <h1>工会总伤变化</h1>
  <div class="guild-total-damage-tendency" ref="chartDom"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { AttackRecord } from "../../../data";
import { useStore } from "../../../store";

const options: echarts.EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      // Use axis to trigger tooltip
      type: "shadow", // 'shadow' as default; can also be 'line' or 'shadow'
    },
  },
  xAxis: {
    type: "category",
    axisLine: {
      show: true,
    },
    data: [],
  },
  yAxis: {
    type: "value",
    axisLine: {
      show: true,
    },
    axisLabel: {
      show: true,
      formatter(res: number) {
        return String((Number(res) / 100000000).toFixed(0)) + "e";
      },
    },
  },
  series: [
    {
      data: [],
      type: "line",
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value) / 100000000).toFixed(2)) + "e";
        },
      },
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
  const totalDamage = useStore().attackRecords.map((i) => {
    return {
      name: i.name,
      value: i.data.reduce((a, c) => a + c.damage, 0),
    };
  });
  // @ts-ignore
  options.xAxis.data = totalDamage.map((i) => i.name);
  // @ts-ignore
  options.series[0].data = totalDamage.map((i) => i.value);
  init();
});
</script>

<style scoped>
.guild-total-damage-tendency {
  height: 600px;
}
</style>
