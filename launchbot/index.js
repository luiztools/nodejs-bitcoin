require('dotenv-safe').config();
const api = require('./api');

const WebSocket = require('ws');
const ws = new WebSocket("wss://stream.binance.com:9443/ws/!bookTicker");

const SYMBOL = 'BTCUSDT';
const profit = 1.1;
let quantity = 0;
let buyPrice = 0;

ws.onmessage = async (event) => {
    process.stdout.write('\033c');

    try {
        const obj = JSON.parse(event.data);
        console.log(`Symbol: ${obj.s}`);
        console.log(`Best ask: ${obj.a}`);
        console.log(`Best bid: ${obj.b}`);
        console.log(`Buy Price: ${buyPrice}`);
        console.log(`Target Price: ${buyPrice * profit}`);

        if (obj.s === SYMBOL) {
            if (!buyPrice) {
                isBought = true;
                const order = await api.newOrder(SYMBOL, 0.001, 0, 'BUY', 'MARKET');
                quantity = parseFloat(order.executedQty);
                buyPrice = parseFloat(order.fills[0].price);
                return;
            }
            else if (parseFloat(obj.b) > (buyPrice * profit)) {
                const order = await api.newOrder(SYMBOL, quantity, 0, 'SELL', 'MARKET');
                console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
                process.exit(1);
            }
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
