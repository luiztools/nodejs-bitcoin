const axios = require("axios");
const WebSocket = require("ws");

const changes = {};
let symbols = [];

async function start() {
    const { data } = await axios.get("https://api.binance.com/api/v3/exchangeInfo");
    symbols = data.symbols.filter(s => s.quoteAsset === "USDT").map(s => s.symbol.toLowerCase());
    const streams = symbols.map(s => `${s}@kline_1m`).join("/");

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.onmessage = (event) => {
        const obj = JSON.parse(event.data);

        if (obj.data.k.x) {
            const openPrice = parseFloat(obj.data.k.o);
            const closePrice = parseFloat(obj.data.k.c);
            const change = ((closePrice * 100) / openPrice) - 100;
            changes[obj.data.s] = change;
            console.log(obj.data.s, changes[obj.data.s]);
        }
    }

    ws.onerror = (err) => console.error(err);

    setInterval(() => {
        console.clear();
        const changeArray = Object.keys(changes).map(k => {
            return { symbol: k, change: changes[k] }
        })

        const topGainers = changeArray.sort((a, b) => b.change - a.change).slice(0, 5);

        console.log("TOP GAINERS");
        topGainers.map(tg => console.log(tg.symbol, `+${tg.change.toFixed(2)}%`));

        const topLosers = changeArray.sort((a, b) => a.change - b.change).slice(0, 5);
        console.log("\nTOP LOSERS");
        topLosers.map(tg => console.log(tg.symbol, tg.change.toFixed(2) + "%"));
    }, 30000);
}

start();