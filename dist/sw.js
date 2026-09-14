const CACHE='paczkoplan-shell-v3.4.0';
const FILES=['./','./index.html','./styles.css','./app.js','./core.js','./network.js','./storage.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png','./vendor/leaflet.js','./vendor/leaflet.css','./vendor/xlsx.full.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('paczkoplan-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  // External map tiles and APIs retain normal HTTP caching; no tile prefetch.
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(new URL('./index.html',self.registration.scope))));return;
  }
  const allowed=FILES.map(p=>new URL(p,self.registration.scope).href);
  if(!allowed.includes(url.href))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
