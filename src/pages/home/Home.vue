<template>
  <div class="home">
    <div class="selector">
      <label>
        <input v-model="viewType" type="radio" name="viewType" value="guildOverview">
        总览
      </label>
      <label>
        <input v-model="viewType" type="radio" name="viewType" value="guildTotalDamage">
        公会总伤变化
      </label>
      <label>
        <input v-model="viewType" type="radio" name="viewType" value="personalView">
        个人视角
      </label>
      <label>
        <input v-model="viewType" type="radio" name="viewType" value="attackDetail">
        出刀一览
      </label>
    </div>
    <template v-if="viewType==='guildOverview'">
      <div style="margin: 20px;">
        <label>
          选择赛季：
          <select v-model="selectedSeason" @change="reRender">
            <template v-for="item in attackRecords">
              <option :value="item.name">{{ item.name }}</option>
            </template>
          </select>
        </label>
      </div>
      <div class="chart" ref="chartRef"></div>
    </template>
    <template v-else-if="viewType==='guildTotalDamage'">
      <GuildTotalDamageTendency/>
    </template>
    <template v-else-if="viewType==='attackDetail'">
      <GuildAttackTimes/>
    </template>
    <template v-else>
      <PersonalTendency/>
    </template>
    <!--    <button @click="saveImage">生成图片，长按保存</button>-->
    <!--    <img :src="src" alt="图片">-->
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import attackRecords from '../../assets/data/index';
import {AttackRecord} from '../../data';
import * as echarts from 'echarts';
import html2canvas from 'html2canvas';
import GuildTotalDamageTendency from './components/GuildTotalDamageTendency.vue';
import PersonalTendency from './components/PersonalTendency.vue';
import GuildAttackTimes from './components/GuildAttackTimes.vue';
import {bossNameCorrect} from "./bossNameCorrect";

type UserName = string;
type LogDate = string;
type BossName = string;
type Damage = number;

const viewType = ref('guildOverview');

watch(()=>viewType.value, res=>{
  if (res==='guildOverview') {
    nextTick(()=>{
      init();
    })
  }
})
const selectedSeason = ref(attackRecords[attackRecords.length - 1].name);

const currentAttackRecord = computed<AttackRecord[]>(() => attackRecords.find(i => i.name === selectedSeason.value)!.data);

const src = ref('');
const saveImage = async () => {
  const el = document.querySelector('#testaaa')! as HTMLElement;
  src.value = (await html2canvas(el, {useCORS: true, width: 2700})).toDataURL();
};
const elementColors: Record<string, string> = {
  光: '#ffd71c',
  虚: '#5e778b',
  暗: '#a50adf',
  土: '#9a7b2d',
  水: '#2287c1',
  火: '#c24913',
};

let chart: echarts.EChartsType;
const chartRef = ref<HTMLElement>();

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
const unselectedLegend: string[] = [];
const buildOption = () => {
  const attackRecord = currentAttackRecord.value;
  let bosses: string[] = [];
  const bossRecord: Record<string, any> = {};
  for (let i = 0; i < attackRecord.length; i++) {
    if (Object.keys(bossRecord).length >= 4) {
      bosses = Object.keys(bossRecord);
      break;
    }
    const originalBoss = attackRecord[i].boss;
    const bossName = `${bossNameCorrect[originalBoss.name] ?? originalBoss.name}--${originalBoss.elemental_type_cn}`;
    bossRecord[bossName] = null;
  }
  bosses = Object.keys(bossRecord);
  const userData = attackRecord.reduce<Record<UserName, AttackRecord[]>>((a, c) => {
    a[c.user_name] = a[c.user_name] || [];
    a[c.user_name].push(c);
    return a;
  }, {});
  const userBossData = Object.entries(userData).reduce<Record<UserName, Record<BossName, Damage>>>((a, c) => {
    a[c[0]] = c[1].reduce<Record<BossName, Damage>>((aa, cc) => {
      const bossName = `${bossNameCorrect[cc.boss.name] ?? cc.boss.name}--${cc.boss.elemental_type_cn}`;
      aa[bossName] = (aa[bossName] ?? 0) + cc.damage;
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
      const date = new Date(Number(`${cc.log_time}000`)).toLocaleDateString().replaceAll('/', '-');
      aa[date] = aa[date] || [];
      aa[date].push(cc);
      return aa;
    }, {});
    return a;
  }, {});

  // @ts-ignore
  option.yAxis.data = usersSortByDamage;
  option.series = bosses.map(boss => {

    const bossElement = boss.split('--')[1];
    return {
      name: boss,
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
        fontSize: 14,
        formatter(res) {
          return String((Number(res.value) / 10000).toFixed(0)) + 'w';
        },
      },
      color: `${elementColors[bossElement]}d0`,
      data: usersSortByDamage.map(user => userBossData[user][boss] ?? 0),
    };
  });
  option.series.unshift({
    name: '',
    type: 'bar',
    barGap: '-100%',
    label: {
      show: true,
      position: 'right',
      distance: 20,
      formatter(res) {
        return String(res.value).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
      },
    },
    color: 'rgba(0,0,0,0)',
    data: usersSortByDamage.map(user => Object.entries(userBossData[user]).filter(i => !unselectedLegend.includes(i[0])).map(i => i[1]).reduce((a, c) => a + c, 0)),
  });
};
const init = () => {
  buildOption();
  chart = echarts.init(chartRef.value!);
  chart.setOption(option);
  window.addEventListener('resize', () => {
    chart.resize();
  });
  // @ts-ignore
  chart.on('legendselectchanged', (params: { name: string }) => {
    const index = unselectedLegend.findIndex(i => i === params.name);
    if (index !== -1) {
      unselectedLegend.splice(index, 1);
    } else {
      unselectedLegend.push(params.name)
    }
    reRender();
  });
};

const reRender = () => {
  buildOption();
  chart!.setOption(option);
};

onMounted(() => {
  init();
});
</script>

<style scoped>
label {
  margin-right: 20px;
}

.chart {
  height: 2200px;
  padding-bottom: 60px;
}
</style>