<template>
  <div class="guild-attack-times">
    <label>
      选择赛季：
      <select v-model="selectedSeason">
        <template v-for="item in attackRecords">
          <option :value="item.name">{{ item.name }}</option>
        </template>
      </select>
    </label>
    <div class="grid-table"
         :style="{gridTemplateColumns: `repeat(${currentSeasonData.remainDateList.length +1 }, 1fr)`}">
      <div class="grid-item-col-row-desc">
        <span>用户\日期</span>
      </div>
      <template v-for="date in currentSeasonData.remainDateList">
        <div class="grid-item-date">
          <span>{{ date }}</span>
        </div>
      </template>
      <template v-for="userDateData in Object.entries(currentSeasonData.userDateData)">
        <div class="grid-item-user">
          <span>{{ userDateData[0] }}</span>
        </div>
        <template v-for="date in currentSeasonData.remainDateList">
          <div class="grid-item-records">
            <template v-for="record in userDateData[1][date]">
              <div class="record">
                <div class="damage">
                  <span>{{ bossNameCorrect[record.boss.name] || record.boss.name }}Lv{{
                      record.boss.level
                    }}{{ record.boss.elemental_type_cn }}</span>
                  <span>:{{ record.damage }}</span>
                </div>
                <div class="role-list">
                  <template v-for="role in record.role_list">
                    <img :src="role.icon" style="width: 40px;height: 40px;" alt="">
                  </template>
                </div>
              </div>
            </template>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {AttackRecord} from '../../../data';
import {computed, onMounted, ref} from 'vue';
import {bossNameCorrect} from "../bossNameCorrect";
import {useStore} from "../../../store";

const attackRecords = computed(()=>{
  return useStore().attackRecords;
})
const seasonUserDateData = computed(()=>{
  return useStore().attackRecords.map(attackRecord => {
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
      userData: attackRecord.data.reduce<Record<string, Record<string, AttackRecord[]>>>((a, c) => {
        const date = new Date(Number(`${c.log_time}000`)).toLocaleDateString().replaceAll('/', '-');
        a[c.user_name] = a[c.user_name] || {};
        a[c.user_name][date] = a[c.user_name][date] || [];
        a[c.user_name][date].push(c);
        return a;
      }, {}),
    };
  });
})

const selectedSeason = ref('');

const currentSeasonData = computed(() => {
  const seasonData = seasonUserDateData.value.find(i => i.season === selectedSeason.value);
  return {
    remainDateList: seasonData?.remainDateList || [],
    userDateData: seasonData?.userData || {},
  };
});
onMounted(() => {
  selectedSeason.value = attackRecords.value[attackRecords.value.length - 1].name;
})
</script>

<style scoped>
.guild-attack-times {
  padding: 20px;
}

.grid-table {
  position: relative;
  display: grid;
  grid-auto-columns: auto;
  margin: 20px;
}

.grid-item-date, .grid-item-col-row-desc {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-width: 120px;
  height: 40px;
  border: solid 1px #dfcda3;
  background-color: #F6F3EDF2;
}

.grid-item-date {
  border-left: none;
}

.grid-item-user {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: solid 1px #dfcda3;
  border-top: none;
}

.grid-item-records {
  padding: 10px;
  border: solid 1px #dfcda3;
  border-top: none;
  border-left: none;
}

.grid-item-records .record {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.grid-item-records .record .role-list {
  display: flex;
  flex-wrap: nowrap;
}

.grid-item-records .record img {
  display: inline-block;
  width: 40px;
  height: 40px;
}
</style>