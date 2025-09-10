
const CACHE='fluryy-cache-v10';
const OFFLINE=['/','/index.html','/css/styles.css','/js/main.js','/assets/logo-fluryy.svg','/assets/favicon.svg','/providers.html','/pets.html','/dashboard.html','/login.html','/register.html','/thanks.html','/install.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(OFFLINE)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return resp}).catch(()=>caches.match('/'))))});
