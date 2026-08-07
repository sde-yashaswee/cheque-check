// Service Worker for ChequeCheck
// This file is currently minimal to satisfy PWA installability requirements.
// It can be extended later with caching strategies.

const CACHE_NAME = 'cheque-check-v1';

self.addEventListener('install', (event) => {
  // Use skipWaiting to ensure the new service worker takes over immediately
  self.skipWaiting();
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Clean up old caches if needed in the future
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through for now. 
  // You can implement caching strategies here (e.g., Cache-First or Network-First).
  event.respondWith(fetch(event.request));
});
