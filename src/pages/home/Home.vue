<template>
  <div class="top">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import attackRecord from '../../assets/31-attack-record.json';
import { AttackRecord } from '../../data';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
const bossNameCorrect: Record<string, string> = {
  boss_nine_tailed_fox_guild: '水狐',
  水狐: 'boss_nine_tailed_fox_guild',
};
const option: echarts.EChartsOption = {
  // tooltip: {
  //   trigger: 'axis',
  //   axisPointer: {
  //     // Use axis to trigger tooltip
  //     type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
  //   },
  // },
  legend: {
    top: '40',
  },
  grid: {
    top: '80',
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
  series: [
    {
      name: 'Direct',
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
      },
      emphasis: {
        focus: 'series',
      },
      data: [320, 302, 301, 334, 390, 330, 320],
    },
    {
      name: 'Mail Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
      },
      emphasis: {
        focus: 'series',
      },
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: 'Affiliate Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
      },
      emphasis: {
        focus: 'series',
      },
      data: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      name: 'Video Ad',
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
      },
      // emphasis: {
      //   focus: 'series'
      // },
      data: [150, 212, 201, 154, 190, 330, 410],
    },
    {
      name: 'Search Engine',
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
      },
      emphasis: {
        focus: 'series',
      },
      data: [820, 832, 901, 934, 1290, 1330, 1320],
    },
  ],
};
const buildOption = () => {
  let bosses: string[] = [];
  const bossRecord: Record<string, any> = {};
  for (let i = 0; i < attackRecord.length; i++) {
    if (Object.keys(bossRecord).length >= 4) {
      bosses = Object.keys(bossRecord);
      break;
    }
    const originalBoss = attackRecord[i].boss;
    const bossName = `${ bossNameCorrect[originalBoss.name] ?? originalBoss.name }--${ originalBoss.elemental_type_cn }`;
    bossRecord[bossName] = null;
  }

  const userData = attackRecord.reduce<Record<string, AttackRecord[]>>((a, c) => {
    a[c.user_name] = a[c.user_name] || [];
    a[c.user_name].push(c);
    return a;
  }, {});
  const userBossData = Object.entries(userData).reduce((a, c) => {
    a[c[0]] = c[1].reduce<Record<string, number>>((aa, cc) => {
      aa[cc.boss.name] = (aa[cc.boss.name] || 0) + cc.damage;
      return aa;
    }, {});
    return a;
  }, {} as Record<string, Record<string, number>>);

  const usersSortByDamage = Object.keys(userBossData).sort((a, b) => {
    const aDamage = Object.values(userBossData[a]).reduce((a, c) => a + c, 0);
    const bDamage = Object.values(userBossData[b]).reduce((a, c) => a + c, 0);
    return aDamage - bDamage;
  });

  // @ts-ignore
  option.yAxis.data = usersSortByDamage;
  option.series = bosses.map(boss => {
    const originalBossName = bossNameCorrect[boss.split('--')[0]] ?? boss.split('--')[0];
    console.log(originalBossName);
    return {
      name: boss,
      type: 'bar',
      stack: 'total',
      label: {
        show: false,
        fontSize: 14,
        formatter(res) {
          return String(res.value).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        },
      },
      data: usersSortByDamage.map(user => userBossData[user][originalBossName] ?? 0),
    };
  });
  option.series.unshift({
    name: '',
    type: 'bar',
    barGap: '-100%',
    label: {
      show: true,
      position: 'right',
      formatter(res) {
        return String(res.value).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
      },
    },
    color: 'rgba(0,0,0,0)',
    data: usersSortByDamage.map(user => Object.values(userBossData[user]).reduce((a, c) => a + c, 0)),
  });
};
const init = () => {
  buildOption();
  console.log(option);
  echarts.init(chartRef.value!).setOption(option);
};

onMounted(() => {
  init();
});
</script>

<style scoped>
.chart {
  height: 2200px;
  margin-bottom: 1000px;
}
</style>