//index.js
const api = require('./api');
console.log('Iniciando monitoramento!');
setInterval(async () => {
    //console.log(await api.time());
    console.log(await api.depth());
}, process.env.CRAWLER_INTERVAL);