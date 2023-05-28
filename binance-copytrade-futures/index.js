require("dotenv").config();

const accounts = [];
const api = require("./api");

async function loadAccounts() {
    const { listenKey } = await api.connectAccount();
    console.log(`ListenKey obtained/updated: ${listenKey}`);

    let i = 1;
    while (process.env[`TRADER${i}_API_KEY`]) {
        accounts.push({
            apiKey: process.env[`TRADER${i}_API_KEY`],
            apiSecret: process.env[`TRADER${i}_API_SECRET`]
        })
        i++;
    }
    console.log(`${i - 1} copy accounts loaded`);

    return listenKey;
}

function copyTrade(trade) {
    const data = {
        symbol: trade.s,
        side: trade.S,
        type: trade.o
    }

    if (trade.q && parseFloat(trade.q))
        data.quantity = trade.q;

    if (trade.p && parseFloat(trade.p))
        data.price = trade.p

    if (trade.f && trade.f !== "GTC")
        data.timeInForce = trade.f;

    if (trade.sp && parseFloat(trade.sp))
        data.stopPrice = trade.sp;

    if (trade.ps)
        data.positionSide = trade.ps;

    if (trade.AP && parseFloat(trade.AP))
        data.activationPrice = trade.AP;

    if (trade.cr && parseFloat(trade.cr))
        data.callbackRate = trade.cr;

    return data;
}

const WebSocket = require("ws");

const oldOrders = {};

async function start() {
    const listenKey = await loadAccounts();

    const ws = new WebSocket(`${process.env.BINANCE_WS_URL}/${listenKey}`);
    ws.onmessage = async (event) => {
        
        try {
            const trade = JSON.parse(event.data);
            
            if (trade.e === "ORDER_TRADE_UPDATE" && !oldOrders[trade.i]) {
                oldOrders[trade.i] = true;

                console.clear();

                const data = copyTrade(trade.o);

                const promises = accounts.map(acc => api.newOrder(data, acc.apiKey, acc.apiSecret));
                const results = await Promise.allSettled(promises);
                console.log(results);

                //para não entrar em loop durante os testes, descomente abaixo
                process.exit(0);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    ws.onerror = (event) => {
        console.error(event);
    }

    console.log("Waiting news...");

    setInterval(() => {
        api.connectAccount();
    }, 59 * 60 * 1000)
}

start();