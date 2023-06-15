<template>
  <div class="guild-attack-times">
    <h1>公会出刀一览</h1>
    <label>
      选择赛季：
      <select v-model="selectedSeason">
        <template v-for="item in attackRecords">
          <option :value="item.name">{{ item.name }}</option>
        </template>
      </select>
    </label>
    <div class="grid-table">
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
                  <span>{{bossNameCorrect[record.boss.name] || record.boss.name}}Lv{{record.boss.level}}{{record.boss.elemental_type_cn}}</span>
                  <span>:{{record.damage}}</span>
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
import attackRecords from '../../../assets/data';
import {AttackRecord} from '../../../data';
import {computed, ref} from 'vue';
const bossNameCorrect: Record<string, string> = {
  boss_nine_tailed_fox_guild: '水狐',
  九尾狐佳岚: '水狐',
  boss_invader_director_guild: '导演',
  boss_harvester_guild_fury: '蚊子',
  boss_graboid_guild_fury: '牛虫',
  boss_minister_guild: '邓肯',
  宰相邓肯: '邓肯',
  boss_robot_knight_new_guild: '帝国骑士',
  boss_portrait_guild_43th: '画像',
  boss_admiral_guild_43th_modified: '船长',
  boss_admiral_guild_43th: '船长',
  boss_mech_guild_fury_43th: '熊猫',
};

const seasonUserDateData = attackRecords.map(attackRecord => {
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

const selectedSeason = ref(attackRecords[attackRecords.length - 1].name);

const currentSeasonData = computed(() => {
  const seasonData = seasonUserDateData.find(i => i.season === selectedSeason.value);
  return {
    remainDateList: seasonData?.remainDateList || [],
    userDateData: seasonData?.userData || {},
  };
});
</script>

<style scoped>
.guild-attack-times {
  padding: 20px;
}
.grid-table {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-auto-columns: auto;
  margin: 20px;
}
.grid-item-date, .grid-item-col-row-desc {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-width: 120px;
  height: 40px;
  border: solid 1px #dfcda3;
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