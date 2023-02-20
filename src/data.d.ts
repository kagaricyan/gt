declare module '*attack-record.json' {
  import { AttackRecord } from './data';
  const data: AttackRecord[];
  export default data;
}

export interface AttackRecord {
  server_time: number;
  log_time: number;
  user_name: string;
  boss: {
    name: string;
    level: number;
    elemental_type_cn: string;
  };
  damage: number;
  role_list: Array<{
    icon: string;
    dps: number;
    toughness: number;
    recovery: number
  }>;
}

