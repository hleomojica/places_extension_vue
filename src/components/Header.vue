<script setup>
import { ref, onMounted } from "vue";
import { useMapStore } from "@/stores/maps";
import { usePlacesStore } from "@/stores/places";
import * as cheerio from "cheerio";

const counter = useMapStore();
const placesStore = usePlacesStore();
const loading = ref(placesStore.loading);
const alertDefault = {
  text: null,
  type: null,
};
const alert = ref(alertDefault);

const getPageHtml = async () => {
  placesStore.loading = true;
  if (import.meta.env.VITE_ENV === "DEV") {
    // Get the data from file mock.json on root
    const response = await fetch("/mock.json");
    const data = await response.json();
    // console.log("Mock data -->", data);
    insertPlaces(data);
  } else {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      // Execute the script on the current tab
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getContentScript,
      });

      const response = result[0]?.result;
      if (!response) {
        console.log("response is null");
        return;
      }
      // Parse the html and extract the links
      let pageHtml = response.pageHtml || null;
      const links = extractLinks(pageHtml);
      const obtainedPlaces = obtainPlaces(links);

      // update local var and save in the store
      insertPlaces(obtainedPlaces);
    } catch (error) {
      setAlert("Error loading places", "error");
      console.log("error", error);
    } finally {
      loading.value = false;
    }
  }
  placesStore.loading = false;
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
  const newPlaces = [];
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
    newPlaces.push(newPlace);
  });
  return newPlaces;
};

function insertPlaces(foundPlaces) {
  if (foundPlaces.lenght === 0) return false;
  const placeIds = placesStore.places.map((place) => place.place_id);
  const newPlaces = foundPlaces.filter(
    (place) => !placeIds.includes(place.place_id)
  );
  console.log("newPlaces --> ", newPlaces);
  if (newPlaces.length === 0) {
    setAlert("No places added", "error");
    return false;
  }
  placesStore.addPlaces(newPlaces);
  counter.updateCounter(placesStore.places.length);
  updateLocalStorage();
  setAlert(`${newPlaces.length} places added`, "success");
  return true;
}

const getContentScript = () => {
  function getPageHtml() {
    return document.documentElement.outerHTML;
  }
  return { pageHtml: getPageHtml() };
};

async function copyToClipboard() {
  let text = "";
  placesStore.places.forEach((place) => {
    text += `${place.name}, ${place.place_id}\n`;
  });
  text = text.trim();
  await navigator.clipboard.writeText(text);
  setAlert("Copied", "success");
}

/*
 * Clear places and counter
 */
const clearPlaces = () => {
  placesStore.places = [];
  updateLocalStorage();
  counter.updateCounter(0);
};

/*
 * Update local storage
 */
const updateLocalStorage = () => {
  const data = placesStore.places;
  chrome.storage.local.set({ places: data }, () => {
    console.log("Data stored successfully");
  });
};

/*
 * Set alert on top of the page
 */
const setAlert = (text = "", type = "success") => {
  alert.value = { text, type };
  setTimeout(() => {
    alert.value = alertDefault;
  }, 2000);
};
</script>
<template>
  <div
    class="w-full p-5 mx-auto sticky top-1 z-50 bg-white rounded-lg shadow-sm border"
  >
    <div class="relative">
      <span
        v-if="alert.text"
        class="absolute text-green-600 right-0"
        :class="{
          'text-green-600 ': alert.type === 'success',
          'text-red-600 ': alert.type === 'error',
        }"
        >{{ alert.text }}</span
      >
    </div>
    <div class="flex flex-col items-center justify-center">
      <h2 class="total text-4xl">{{ counter.count }}</h2>
      <h2 class="total text-xl">Places Found</h2>
      <div class="flex items-center justify-center mt-2">
        <button
          :disabled="loading"
          @click="getPageHtml"
          type="button"
          class="text-white w-full bg-rmvf-900 hover:bg-rmvf-900/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-1 mb-2"
        >
          <svg
            class="w-4 h-4 mr-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 19"
          >
            <path
              fill-rule="evenodd"
              d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
              clip-rule="evenodd"
            />
          </svg>
          Load more
        </button>
        <div class="flex justify-center items-center">
          <button
            @click="copyToClipboard"
            class="flex items-center justify-center px-3 py-2.5 mr-1 mb-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg toggle-full-view hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 dark:bg-gray-800 focus:outline-none dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m7.708 2.292.706-.706A2 2 0 0 1 9.828 1h6.239A.97.97 0 0 1 17 2v12a.97.97 0 0 1-.933 1H15M6 5v4a1 1 0 0 1-1 1H1m11-4v12a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V9.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 5h5.239A.97.97 0 0 1 12 6Z"
              />
            </svg>
          </button>
          <button
            @click="clearPlaces"
            class="flex items-center justify-center px-3 py-2.5 mr-2 mb-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg toggle-full-view hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 dark:bg-gray-800 focus:outline-none dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.total {
  background: -webkit-linear-gradient(315deg, #006494 25%, #ff5142);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
