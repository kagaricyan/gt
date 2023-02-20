<template>
  <div class="home">
    <img class="fixed-top-left" src="../../assets/images/20230106.png" alt="会战logo">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import attackRecord from '../../assets/attact-record.json';
import { AttackRecord } from '../../data';
import * as echarts from 'echarts';

type UserName = string;
type LogDate = string;
type BossName = string;
type Damage = number;

const elementColors: Record<string, string> = {
  光: '#ffd71c',
  虚: '#5e778b',
  暗: '#a50adf',
  土: '#9a7b2d',
  水: '#2287c1',
  火: '#c24913',
};

const chartRef = ref<HTMLElement>();
const bossNameCorrect: Record<string, string> = {
  boss_nine_tailed_fox_guild: '水狐',
  水狐: 'boss_nine_tailed_fox_guild',
  boss_invader_director_guild: '导演',
  导演: 'boss_invader_director_guild',
};
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
  series: [],
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

  const userData = attackRecord.reduce<Record<UserName, AttackRecord[]>>((a, c) => {
    a[c.user_name] = a[c.user_name] || [];
    a[c.user_name].push(c);
    return a;
  }, {});

  const userBossData = Object.entries(userData).reduce<Record<UserName, Record<BossName, Damage>>>((a, c) => {
    a[c[0]] = c[1].reduce<Record<BossName, Damage>>((aa, cc) => {
      aa[cc.boss.name] = (aa[cc.boss.name] || 0) + cc.damage;
      return aa;
    }, {});
    return a;
  }, {});

  const usersSortByDamage = Object.keys(userBossData).sort((a, b) => {
    const aDamage = Object.values(userBossData[a]).reduce((a, c) => a + c, 0);
    const bDamage = Object.values(userBossData[b]).reduce((a, c) => a + c, 0);
    return aDamage - bDamage;
  });

  const userDayData = Object.entries(userData).reduce<Record<UserName, Record<LogDate, AttackRecord[]>>>((a, c) => {
    a[c[0]] = c[1].reduce<Record<LogDate, AttackRecord[]>>((aa, cc) => {
      const date = new Date(Number(`${ cc.log_time }000`)).toLocaleDateString().replaceAll('/', '-');
      aa[date] = aa[date] || [];
      aa[date].push(cc);
      return aa;
    }, {});
    return a;
  }, {});
  console.log(userDayData);

  // @ts-ignore
  option.yAxis.data = usersSortByDamage;
  option.series = bosses.map(boss => {
    const originalBossName = bossNameCorrect[boss.split('--')[0]] ?? boss.split('--')[0];
    const bossElement = boss.split('--')[1];
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
      color: `${ elementColors[bossElement] }d0`,
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
  echarts.init(chartRef.value!).setOption(option);
};

onMounted(() => {
  init();
});
</script>

<style scoped>
.fixed-top-left {
  height: 60px;
  margin: 40px 0 -80px 40px;
}

.chart {
  height: 2200px;
  padding-bottom: 60px;
}
</style>