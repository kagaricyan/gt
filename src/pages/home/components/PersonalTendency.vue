<template>
  <div class="personal-tendency">
    <h1>个人总伤变化</h1>
    <div style="margin: 20px;">
      <label>
        选择用户：
        <select v-model="selectedUser" @change="reRender">
          <template v-for="item in allUsers">
            <option :value="item">{{ item }}</option>
          </template>
        </select>
      </label>
    </div>
    <div class="chartDom" ref="chartDom"></div>
    <h1>个人每日出刀记录</h1>
    <div class="chartDom" ref="chartDom1"></div>
<!--    <h1>公会出刀时间分布</h1>-->
<!--    <div class="chartDom" style="height: 2000px;" ref="chartDom2"></div>-->
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import * as echarts from 'echarts';
import attackRecords from '../../../assets/data/index';
import {AttackRecord} from '../../../data';
import {bossNameCorrect} from "../bossNameCorrect";

const seasonUserData = attackRecords.map(attackRecord => {
  const lastLogTime = Number(`${attackRecord.data[0].log_time}000`);
  const firstLogTime = Number(`${attackRecord.data[attackRecord.data.length - 1].log_time}000`);
  const onDayMillSeconds = 24 * 60 * 60 * 1000;

  const remainDateList: string[] = [];
  for (let i = firstLogTime; i <= lastLogTime; i = i + onDayMillSeconds) {
    const date = new Date(i).toLocaleDateString().replaceAll('/', '-');
    remainDateList.push(date);
  }
  return {
    season: attackRecord.name,
    remainDateList,
    userData: attackRecord.data.reduce<Record<string, AttackRecord[]>>((a, c) => {
      a[c.user_name] = a[c.user_name] || [];
      a[c.user_name].push(c);
      return a;
    }, {}),
  };
});
const selectedUser = ref('');
const allUsers = Array.from(new Set(new Set(attackRecords.map(i => i.data.map(t => t.user_name)).flat())));
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
    data: [],
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: true,
    },
    axisLabel: {
      show: true,
      formatter(res: number) {
        return String((Number(res) / 100000000).toFixed(0)) + 'e';
      },
    },
  },
  series: [
    {
      data: [],
      type: 'line',
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value) / 100000000).toFixed(3)) + 'e';
        },
      },
    },
  ],
};
const options1: echarts.EChartsOption = {
  legend: {
    data: [],
  },
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
    data: [],
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: true,
    },
    axisLabel: {
      show: true,
      formatter(res: number) {
        return String((Number(res) / 10000).toFixed(0)) + 'w';
      },
    },
  },
  series: [
    {
      data: [],
      type: 'line',
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value) / 10000).toFixed(3)) + 'w';
        },
      },
    },
  ],
};
const options2: echarts.EChartsOption = {
  tooltip: {
    show: true,
    formatter(res: any) {
      const record = res.data[2].data as AttackRecord;
      return `${record.user_name} : ${bossNameCorrect[record.boss.name]}`;
    },
  },
  xAxis: {
    splitNumber: 14,
    axisLine: {
      show: true,
    },
  },
  yAxis: {
    type: 'time',
    splitNumber: 24,
  },
  series: [
    {
      symbolSize: 10,
      data: [],
      type: 'scatter',
      large: true,
    },
  ],
};
const chartDom = ref<HTMLElement>();
const chartDom1 = ref<HTMLElement>();
const chartDom2 = ref<HTMLElement>();
let chart: echarts.EChartsType;
let chart1: echarts.EChartsType;
let chart2: echarts.EChartsType;

const buildOption = () => {
  // @ts-ignore
  options.xAxis.data = seasonUserData.map(i => i.season);
  // @ts-ignore
  options.series[0].data = seasonUserData.map(seasonData => {
    return (seasonData.userData[selectedUser.value] || []).reduce((a, c) => a + c.damage, 0);
  });

  // @ts-ignore
  options1.xAxis.data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => `Day${i}`);
  // @ts-ignore
  options1.series = seasonUserData.map(seasonData => {
    const attackRecord = seasonData.userData[selectedUser.value] || [];
    const groupedByDateData = attackRecord.reduce<Record<string, AttackRecord[]>>((a, c) => {
      const date = new Date(Number(`${c.log_time}000`)).toLocaleDateString().replaceAll('/', '-');
      a[date] = a[date] || [];
      a[date].push(c);
      return a;
    }, {});

    return {
      type: 'line',
      name: seasonData.season,
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value) / 10000).toFixed(3)) + 'w';
        },
      },
      data: seasonData.remainDateList.map(i => (groupedByDateData[i] || []).reduce((a, c) => a + c.damage, 0)),
    };
  });
  // @ts-ignore
  options1.legend.data = seasonUserData.map(i => i.season);

  const allDataGroupedByDate = attackRecords.map(season => {
    const lastLogTime = Number(`${season.data[0].log_time}000`);
    const firstLogTime = Number(`${season.data[season.data.length - 1].log_time}000`);
    const onDayMillSeconds = 24 * 60 * 60 * 1000;

    const remainDateList: string[] = [];
    for (let i = firstLogTime; i <= lastLogTime; i = i + onDayMillSeconds) {
      const date = new Date(i).toLocaleDateString().replaceAll('/', '-');
      remainDateList.push(date);
    }
    return {
      season: season.name,
      logTimes: season.data.map(i => {
        const dateTime = new Date(Number(`${i.log_time}000`));
        const date = dateTime.toLocaleDateString().replaceAll('/', '-');
        const time = dateTime.toLocaleTimeString();
        const index = remainDateList.findIndex(i => i === date);
        return [index + 1, `2023-01-01 ${time}`, {data: i}];
      }),
    };
  });
  // @ts-ignore
  options2.series[0].data = allDataGroupedByDate.map(i => i.logTimes)[5];
};
const init = () => {
  buildOption();
  chart = echarts.init(chartDom.value!);
  chart1 = echarts.init(chartDom1.value!);
  // chart2 = echarts.init(chartDom2.value!);
  chart.setOption(options);
  chart1.setOption(options1);
  // chart2.setOption(options2);

};
const reRender = () => {
  buildOption();
  chart!.setOption(options);
  chart1!.setOption(options1);
  // chart2!.setOption(options2);
};
onMounted(() => {
  init();
});
</script>


<style scoped>
.chartDom {
  height: 500px;
}
</style>