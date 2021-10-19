console.log("Sw: Limpio");

const CACHE_STATIC_NAME = 'static-v1'
const DYMAMIC_CACHE_NAME = 'dynamic-v1'
const CACHE_INMUTABLE_NAME = 'inmutable-v1'

let swDirectory = "/PWA-U2-P5-PGM/"

function cleanCache(cacheName,sizeItems) {
    caches.open(cacheName)
        .then(cache =>{
            cache.keys().then(keys =>{
                console.log(keys)
                if (keys.length >= sizeItems) {
                    cache.delete(keys[0]).then(()=>{
                        cleanCache(cacheName,sizeItems)
                    })
                }
            })
            
        })
}

self.addEventListener('install',(event) =>{
    console.log(event.target.location.href);
    if (event.target.location.href.includes('localhost')) {
        swDirectory = '/'
    }

    //Crear el caché y almacenar el APPSHELL
    const promesaCache = caches.open(CACHE_STATIC_NAME)
        .then(cache => {
            return cache.addAll([
                swDirectory,
                swDirectory+'index.html',
                swDirectory+'css/page.css',
                swDirectory+'img/xiao.jpg',
                swDirectory+'js/app.js',
                swDirectory+'pages/view-offline.html',
                swDirectory+'img/notfound.png'
            ])
        })

    const promInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => {
            return cache.addAll([
                'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css',
                'https://code.jquery.com/jquery-3.5.1.min.js'
                
            ])
        })
    event.waitUntil(Promise.all([promesaCache,promInmutable]))
})

self.addEventListener('activate', (event)=>{
    const resDelCache = caches.keys().then(keys => {
        keys.forEach(key =>{
            if (key !== CACHE_STATIC_NAME && key.includes('static')) {
                return caches.delete(key)
            }
        })
    })
    event.waitUntil(resDelCache)
})

self.addEventListener('fetch',(event) =>{


    //2. Caché cith network fallback
    //Busca en caché y si no lo encuentra va a la red
    const respuestaCache = caches.match(event.request)
        .then(resp =>{
            if (resp) {
                return resp
            }
            console.log("No esta en caché ",event.request.url);

            return fetch(event.request)
                .then(respNet => {
                    caches.open(DYMAMIC_CACHE_NAME)
                        .then(cache =>{
                            cache.put(event.request,respNet).then(ok =>{
                                cleanCache(DYMAMIC_CACHE_NAME,5)
                            })
                            
                        })
                    return respNet.clone()
                }).catch( (err)=> {
                    console.log('Error al solicitar el recurso');
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match(swDirectory+'pages/view-offline.html')
                    }
                    if (event.request.url.includes('.jpg')) {
                        return caches.match(swDirectory+'img/notfound.png')
                    }
                    if (event.request.url.includes('.png')) {
                        return caches.match(swDirectory+'img/notfound.png')
                    }
                    
                })
        })
    event.respondWith(respuestaCache)

})