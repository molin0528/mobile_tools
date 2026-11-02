// Service Worker for offline support
const CACHE_PREFIX = 'attendance-pwa-';
const CACHE_NAME = CACHE_PREFIX + 'v38';

const ASSETS = [
    './',
    './index.html',
    './records.html',
    './edit.html',
    './history.html',
    './manifest.json',
    './styles.css'
];

// 安装：缓存静态资源，成功后才激活新版本
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).then(() => {
                // 只有缓存成功才跳过等待，避免离线时清空旧缓存
                self.skipWaiting();
            }).catch((err) => {
                console.log('Cache addAll failed (offline?):', err);
                // 不 skipWaiting，保留旧 Service Worker 与旧缓存
            });
        })
    );
});

// 激活：仅当新缓存非空时清理旧版本缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.keys()).then((keys) => {
            if (!keys || keys.length === 0) {
                // 新缓存为空（可能离线安装），保留旧缓存
                return;
            }
            return caches.keys().then((allKeys) => {
                return Promise.all(
                    allKeys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                );
            });
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 拦截请求：缓存优先，网络失败时回退到缓存或离线页
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                return cached;
            }
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                // 网络失败：导航请求回退到 index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return cached;
            });
        })
    );
});