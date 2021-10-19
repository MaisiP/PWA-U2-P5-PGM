let url = window.location.href
let swDirectory = "/PWA-U2-P5-PGM/"

if(navigator.serviceWorker){

    if (url.includes('localhost')) {
        swDirectory = '/'
    }
    
    navigator.serviceWorker.register(swDirectory+'sw.js')
}
