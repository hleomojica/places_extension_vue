<script setup>
import { ref, onMounted } from "vue";
import { useMapStore } from "@/stores/maps";
import { usePlacesStore } from "@/stores/places";
import * as cheerio from "cheerio";

const counter = useMapStore();
const placesStore = usePlacesStore();
const loading = ref(placesStore.loading);

const getPageHtml = async () => {
  placesStore.loading = true;
  if (import.meta.env.VITE_ENV === "DEV") {
    // Get the data from file mock.json on root
    const response = await fetch("/mock.json");
    const data = await response.json();
    console.log("data", data);
    insertPlaces(data);
  } else {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
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

      console.log(" links-->", links);
      console.log(" places-->", places.value);

      // Store the data in the local storage
      const data = placesStore.places;

      chrome.storage.local.set({ places: data }, () => {
        console.log("Data stored successfully");
      });
    } catch (error) {
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
  // console.log('placeIds', placeIds)
  const newPlaces = foundPlaces.filter(
    (place) => !placeIds.includes(place.place_id)
  );
  console.log("newPlaces", newPlaces);
  if (newPlaces.length === 0) return false;
  placesStore.setPlaces(newPlaces);
  //update counter
  // console.log("places -->", placesStore.places.length);
  counter.updateCounter(placesStore.places.length);
  return true;
}

const getContentScript = () => {
  function getPageHtml() {
    return document.documentElement.outerHTML;
  }
  return { pageHtml: getPageHtml() };
};
</script>
<template>
  <div class="w-full p-5 mx-auto bg-white rounded-xl shadow-md">
    <div class="flex flex-col items-center justify-center">
      <div class="text-xl font-medium text-black mb-2">
        <button
          :disabled="loading"
          @click="getPageHtml"
          class="w-full bg-primary-900 text-white active:bg-primary-600 text-sm px-4 py-2 rounded-xl shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear focus:ring-2 focus:ring-offset-2 focus:ring-primary-900 disabled:opacity-75 transition-all duration-150"
          type="button"
        >
          Load places
        </button>
      </div>
      <span
        class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500"
      >
        {{ counter.count }} Places added
      </span>
    </div>
  </div>
</template>
