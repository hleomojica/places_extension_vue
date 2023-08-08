<template class="overflow-auto">
  <div class="flex flex-col justify-center mt-2">
    <button
      :disabled="loading"
      @click="getPageHtml"
      class="bg-primary-900 text-white active:bg-primary-600 text-sm px-4 py-2 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear focus:ring-2 focus:ring-offset-2 focus:ring-primary-900 disabled:opacity-75 transition-all duration-150"
      type="button"
    >
      Get places
    </button>
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
            <th scope="col" class="px-6 py-3">Name</th>
            <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(place, idx) in places"
            :key="idx"
            class="border-b border-gray-200 dark:border-gray-700"
          >
            <td class="px-6 py-4">{{ place.name }}</td>
            <th
              scope="row"
              class="px-6 py-4 font-medium text-gray-900 bg-gray-50 dark:text-white dark:bg-gray-800"
            >
              {{ place.place_id }}
            </th>
            <td class="px-6 py-4">delete</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as cheerio from "cheerio";
import Loader from "./Loader.vue";
import { useMapStore } from "@/stores/maps";

const counter = useMapStore();

const places = ref([]);
const loading = ref(false);

const getPageHtml = async () => {
  loading.value = true;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getContentScript,
  });
  const response = result[0]?.result;
  if (!response) {
    console.log("response is null");
    return;
  }
  let pageHtml = response.pageHtml || null;
  const links = extractLinks(pageHtml);
  const obtainedPlaces = obtainPlaces(links);
  insertPlaces(obtainedPlaces);
  // Set the data to be stored
  const data = places.value;
  // Store the data in the local storage
  chrome.storage.local.set({ places: data }, () => {
    console.log("Data stored successfully");
  });

  console.log(" links-->", links);
  console.log(" places-->", places.value);

  loading.value = false;
};

const extractLinks = (html) => {
  let links = [];
  const $ = cheerio.load(html);
  links = $('a[href^="https://www.google.com/maps/place/"]')
    .map((i, el) => {
      return {
        href: $(el).attr("href"),
        ariaLabel: $(el).attr("aria-label"),
      };
    })
    .get();
  return links;
};

const obtainPlaces = (links) => {
  const places = [];
  links.forEach((link) => {
    // Extract the place_id from the link
    const codeRegex = /19s(.*)\?/;
    const match = codeRegex.exec(link.href);
    const code = match ? match[1] : null;
    const newPlace = {
      place_id: code,
      name: link.ariaLabel,
      url: null,
    };
    places.push(newPlace);
  });
  return places;
};

function insertPlaces(foundPlaces) {
  if (foundPlaces.lenght === 0) return false;
  console.log("places", places.value);
  const placeIds = places.value.map((place) => place.place_id);
  // console.log('placeIds', placeIds)
  const newPlaces = foundPlaces.filter(
    (place) => !placeIds.includes(place.place_id)
  );
  // console.log('newPlaces', newPlaces)
  places.value.push(...newPlaces);
  //update counter
  console.log("places.value.length", places.value.length);
  counter.updateCounter(places.value.length);
  return true;

  // counter.value = places.value.length
}

async function copyToClipboard() {
  let text = "";
  places.value.forEach((place) => {
    text += `${place.name}, ${place.place_id}\n`;
  });
  await navigator.clipboard.writeText(text);
  console.log("Content copied to clipboard");
}

const getContentScript = () => {
  function getPageHtml() {
    return document.documentElement.outerHTML;
  }
  return { pageHtml: getPageHtml() };
};

const clearPlaces = () => {
  places.value = [];
};

// on mounted
const getPlacesFromStorage = () => {
  chrome.storage.local.get(["places"], (result) => {
    console.log("Value currently is ", result.places);
    places.value = result.places ? [...result.places] : [];
    counter.updateCounter(places.value.length);
  });
};

getPlacesFromStorage();
</script>
