<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import Maps from './components/Maps.vue'
import { useMapStore } from '@/stores/maps'
const counter = useMapStore()
const isLoading = ref(true)
const timer = ref(5)

onMounted(() => {
  const intervalId = setInterval(() => {
    timer.value--
  }, 1000)

  setTimeout(() => {
    clearInterval(intervalId)
  }, timer.value * 1000)
})
</script>

<template>
  <header>
    <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-x-4">
      <div class="flex flex-col items-center justify-center">
        <div class="text-xl font-medium text-black mb-2">Place ID extractor</div>
        <span
          class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mr-2 dark:bg-gray-700 dark:text-gray-400 border border-gray-500"
        >
          {{ counter.value }} Places found
        </span>
      </div>
    </div>
    <div
      class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
    >
      <div class="relative">
        <div class="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
        <div
          class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-bold text-2xl"
        >
          {{ timer }}
        </div>
      </div>
    </div>
    <!-- <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">Record</RouterLink>
      </nav>
    </div> -->
  </header>
  <Maps />

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    flex-direction: row;
    place-items: center;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
