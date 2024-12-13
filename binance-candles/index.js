const axios = require("axios");
const WebSocket = require("ws");

async function start() {
    const { data } = await axios.get("https://api.binance.com/api/v3/exchangeInfo");
    const symbols = data.symbols.filter(s => s.quoteAsset === "USDT").map(s => s.symbol.toLowerCase());
    const streams = symbols.map(s => `${s}@kline_1m`).join("/");

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (event) => {
        const obj = JSON.parse(event.data);

        if (obj.data.k.x) {
            const symbol = obj.data.k.s;
            const open = obj.data.k.o;
            const high = obj.data.k.h;
            const low = obj.data.k.l;
            const close = obj.data.k.c;
            console.log({ symbol, open, high, low, close });

            //outros processamentos do seu robô
        }
    }

    ws.onerror = (err) => console.error(err);
}

start();