import {defineStore} from "pinia";
import {AttackRecord} from "../data";
import localforage from "localforage";
import {database} from "../assets/data";

interface AttackRecords {
    name: string;
    data: AttackRecord[]
}

export const useStore = defineStore('store', {
    state: () => ({
        attackRecords: [] as AttackRecords[]
    }),
    actions: {
        async init() {
            const records: AttackRecords[] = (await localforage.getItem<AttackRecords[]>('cn_records')) || [];
            const existNames = records.map(i => i.name);
            for (const item of database) {
                if (!existNames.includes(item.name)) {
                    const data = await fetch(`./records/${item.data}.json`, {headers: {'Content-Type': 'application/json'}});
                    const record = await data.json();
                    records.push({name: item.name, data: record})
                }

            }
            await localforage.setItem('cn_records', records);
            this.attackRecords = records;
        }
    }
})