import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('maps', {

  state: () => {
    return {
      count: 0,
    };
  },
  actions: {
    updateCounter(value) {
      this.count = value;
    },
  },

})
