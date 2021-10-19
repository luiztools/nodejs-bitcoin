require('dotenv-safe').config();
const api = require('./api');

const WebSocket = require('ws');
const ws = new WebSocket("wss://stream.binance.com:9443/ws/!bookTicker");

//escolha o symbol que vai monitorar - set the symbol to monitor
const SYMBOL = 'BTCUSDT';
//escolha o percentual de lucratividade - set the profit percent
const profit = 1.01;
//escolha quanto quer comprar - set the quantity to buy
const buyQty = 0.001;

//não mexa nestas variáveis
let quantity = 0;
let buyPrice = 0;
let isBought = false;

ws.onmessage = async (event) => {

    try {
        const obj = JSON.parse(event.data);

        if (obj.s === SYMBOL) {
            process.stdout.write('\033c');
            console.log(`Symbol: ${obj.s}`);
            console.log(`Best ask: ${obj.a}`);
            console.log(`Best bid: ${obj.b}`);
            console.log(`Buy Price: ${buyPrice}`);
            console.log(`Target Price: ${buyPrice * profit}`);

            if (!isBought) {
                isBought = true;
                const order = await api.newOrder(SYMBOL, buyQty, 0, 'BUY', 'MARKET');
                if (order.status !== 'FILLED') {
                    console.log(order);
                    process.exit(1);
                }

                quantity = parseFloat(order.executedQty);
                buyPrice = parseFloat(order.fills[0].price);
                return;
            }
            else if (quantity > 0 && parseFloat(obj.b) > (buyPrice * profit)) {
                const order = await api.newOrder(SYMBOL, quantity, 0, 'SELL', 'MARKET');
                if (order.status !== 'FILLED')
                    console.log(order);
                else
                    console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
                process.exit(1);
            }
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
