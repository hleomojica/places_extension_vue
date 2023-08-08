import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('maps', () => {
  const count = ref(0)
  return { count }
})
