<script setup>
import { ref } from "vue";
import Loader from "./Loader.vue";
import { useMapStore } from "@/stores/maps";
import { usePlacesStore } from "@/stores/places";

const counter = useMapStore();
const placesStore = usePlacesStore();
const loading = ref(placesStore.loading);

const getPlacesFromStorage = () => {
  console.log("Env var -->", import.meta.env.VITE_ENV);
  if (import.meta.env.VITE_ENV === "DEV") {
    return;
  }

  chrome.storage.local.get(["places"]).then((result) => {
    placesStore.places = result.places ? Object.values(result.places) : [];
    counter.updateCounter(placesStore.places.length);
  });
};

getPlacesFromStorage();
</script>
<template>
  <div class="w-full mx-auto bg-white rounded-lg shadow-sm border">
    <Loader v-if="loading" />
    <!-- TABLE -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase dark:text-gray-400">
          <tr>
            <th scope="col" class="px-2 py-2 font-medium text-md text-center">
              Name
            </th>
            <th
              scope="col"
              class="px-2 py-2 font-medium text-md text-center bg-gray-50 dark:bg-gray-800"
            >
              Place ID
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(place, idx) in placesStore.places"
            :key="idx"
            class="border-b border-gray-200 dark:border-gray-700"
          >
            <td class="px-3 py-2 whitespace-normal">{{ place.name }}</td>
            <th
              class="px-3 py-2 whitespace-normal text-gray-900 bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              {{ place.place_id }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
