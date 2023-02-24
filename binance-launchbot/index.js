require('dotenv').config();
const api = require('./api');

const SYMBOL = process.env.SYMBOL;
const PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY);

const WebSocket = require('ws');
const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`);

//não mexa nestas variáveis
let quantity = 0;
let buyPrice = 0;

ws.on('error', (err) => {
    console.log('WS Error');
    console.error(err);
    process.exit(1);
})

ws.onmessage = async (event) => {

    try {
        const obj = JSON.parse(event.data);
        console.clear();

        console.log(`Symbol: ${obj.s}`);
        console.log(`Best ask: ${obj.a}`);
        console.log(`Best bid: ${obj.b}`);
        console.log(`Buy Price: ${buyPrice}`);
        console.log(`Qty: ${quantity}`);
        console.log(`Notional: ${buyPrice * quantity}`);
        console.log(`Target Price: ${buyPrice * PROFIT}`);

        if (quantity === 0) {
            quantity = -1;

            const order = await api.buy(SYMBOL, BUY_QTY);
            if (order.status !== 'FILLED') {
                console.log(order);
                process.exit(1);
            }

            quantity = parseFloat(order.executedQty);
            buyPrice = parseFloat(order.fills[0].price);
            return;
        }
        else if (quantity > 0 && parseFloat(obj.b) > (buyPrice * PROFIT)) {
            const order = await api.sell(SYMBOL, quantity);
            if (order.status !== 'FILLED')
                console.log(order);
            else
                console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
            process.exit(1);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}