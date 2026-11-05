
const CACHE_NAME = "fire-hydrants-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Инсталиране и кеширане на основните файлове
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Активиране и изчистване на старите кешове
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Зареждане от интернет с резервен кеш
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Не кешираме Supabase заявки и картните плочки
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("openstreetmap.org")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(() => caches.match(request))
  );
});
