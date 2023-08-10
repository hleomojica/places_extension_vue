<template>
  <div class="w-full p-5 mx-auto bg-white rounded-xl shadow-md">
    <!-- BUTTONS -->
    <div class="my-3 flex justify-center items-center">
      <button
        :disabled="loading"
        @click="copyToClipboard"
        type="button"
        class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-2 py-1 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
      >
        Copy
      </button>
      <button
        :disabled="loading"
        @click="clearPlaces"
        type="button"
        class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-1 py-1 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
      >
        Clear
      </button>
    </div>
    <Loader v-if="loading" />
    <!-- TABLE -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase dark:text-gray-400">
          <tr>
            <th scope="col" class="px-2 py-2 font-medium text-md">Name</th>
            <th
              scope="col"
              class="px-2 py-2 font-medium text-md bg-gray-50 dark:bg-gray-800"
            >
              ID
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

<script setup>
import { ref } from "vue";
import Loader from "./Loader.vue";
import { useMapStore } from "@/stores/maps";
import { usePlacesStore } from "@/stores/places";

const counter = useMapStore();
const placesStore = usePlacesStore();

// use compiute
// const places = ref(placess);
const loading = ref(placesStore.loading);

async function copyToClipboard() {
  let text = "";
  places.value.forEach((place) => {
    text += `${place.name}, ${place.place_id}\n`;
  });
  await navigator.clipboard.writeText(text);
  console.log("Content copied to clipboard");
}

const clearPlaces = () => {
  places.value = [];
};

// on mounted
const getPlacesFromStorage = () => {
  console.log("getPlacesFromStorage", import.meta.env.VITE_ENV);
  if (import.meta.env.VITE_ENV === "DEV") {
    return;
  }
  chrome.storage.local.get(["places"], (result) => {
    console.log("Value currently is ", result.places);
    places.value = result.places ? [...result.places] : [];
    counter.updateCounter(places.value.length);
  });
};

getPlacesFromStorage();
</script>
