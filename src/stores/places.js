import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePlacesStore = defineStore("places", {
  state: () => {
    return {
      places: [],
      loading: false,
    };
  },
  actions: {
    setPlaces(value) {
      this.places = value;
    },
  },

  getters: {
    getPlaces() {
      return this.places;
    },
  },

  // optional actions
});
