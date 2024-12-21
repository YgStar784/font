// stores/codeStore.js
import { defineStore } from 'pinia';

export const useCodeStore = defineStore('code', {
    state: () => ({
        codes: {}, // 存储代码数据的对象，key 为 id，value 为代码内容
    }),
    actions: {
        // 根据 ID 获取代码
        getCodeById(id) {
            return this.codes[id] || null;
        },
        // 保存代码
        saveCode(id, code) {
            this.codes[id] = code;
        },
    },
});