const WebSocket = require('ws');
const ws = new WebSocket(`${process.env.STREAM_URL}btcusdt@markPrice@1s`);
let isOpened = false;

const api = require("./api");

ws.onmessage = (event) => {
    process.stdout.write('\033c');
    const obj = JSON.parse(event.data);
    console.log(`Symbol: ${obj.s}`);
    console.log(`Mark Price: ${obj.p}`);

    const price = parseFloat(obj.p);
    if (price < 19000 && !isOpened) {
        console.log('Abrir posição!');
        api.newOrder("BTCUSDT", "0.001", "BUY")
            .then(result => {
                console.log(result);
                isOpened = true;
            })
            .catch(err => console.error(err));
    }
    else if (price > 21000 && isOpened) {
        console.log('Fechar posição!');
        api.newOrder("BTCUSDT", "0.001", "SELL")
            .then(result => {
                console.log(result);
                isOpened = false;
            })
            .catch(err => console.error(err));
    }
}

setInterval(() => {
    api.accountInfo()
        .then(result => console.log(result))
        .catch(err => console.error(err))
}, 10000)