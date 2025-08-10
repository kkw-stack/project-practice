
'use strict';

const CACHE_VERSION = 17;
var CURRENT_CACHES = {
    offline: 'offline-v' + CACHE_VERSION
};
const OFFLINE_URL = '/offline/index.html?v=' + CACHE_VERSION;

function createCacheBustedRequest(url) {
    var request = new Request(url, {cache: 'reload'});

    if ('cache' in request) {
        return request;
    }

    // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
    var bustedUrl = new URL(url, self.location.href);
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
    return new Request(bustedUrl);
}

self.addEventListener('install', event => {
    event.waitUntil(
        // We can't use cache.add() here, since we want OFFLINE_URL to be the cache key, but the actual URL we end up requesting might include a cache-busting parameter.
        fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response) {
            return caches.open(CURRENT_CACHES.offline).then(function(cache) {
                return cache.put(OFFLINE_URL, response);
            });
        })
    );
});

self.addEventListener('activate', event => {
    // Delete all caches that aren't named in CURRENT_CACHES.
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                     if (expectedCacheNames.indexOf(cacheName) === -1) {
                        // If this cache name isn't present in the array of "expected" cache names, then delete it.
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // We only want to call event.respondWith() if this is a navigation request for an HTML page.
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {

        console.log('Handling fetch event for', event.request.url);
        
        event.respondWith(
            fetch(event.request).catch(error => {
                // The catch is only triggered if fetch() throws an exception
                console.log('Fetch failed; returning offline page instead.', error);
                return caches.match(OFFLINE_URL);
            })
        );
    }

});

