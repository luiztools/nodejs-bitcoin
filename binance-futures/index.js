const WebSocket = require('ws');
const ws = new WebSocket(`${process.env.STREAM_URL}btcusdt@markPrice@1s`);

let isOpened = false;

ws.onmessage = (event) => {
    process.stdout.write('\033c');
    const obj = JSON.parse(event.data);
    console.log(`Symbol: ${obj.s}`);
    console.log(`Mark Price: ${obj.p}`);

    const price = parseFloat(obj.p);
    if (price < 19000 && !isOpened) {
        console.log('Abrir posição!');
        isOpened = true;
    }
    else if (price > 21000 && isOpened) {
        console.log('Fechar posição!');
        isOpened = false;
    }
}