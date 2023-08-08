// contentScript.js
console.log('Content script loaded on Google Maps page')

// Extract information from the page (example: place name and place ID)
// const placeNameElement = document.querySelector('h1.section-hero-header-title');
// const placeName = placeNameElement ? placeNameElement.textContent : '';

const placeId = new URLSearchParams(window.location.search).get('placeid')

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getHtml') {
    sendResponse({ html: document.documentElement.outerHTML })
  }
})

// Send the extracted information back to the extension popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPlaceInfo') {
    sendResponse({ placeName, placeId })
  }
})
