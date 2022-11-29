//index.js
const WebSocket = require('ws');
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

let sellPrice = 0;
const profitability = parseFloat(process.env.PROFITABILITY);

ws.onmessage = (event) => {
    console.clear();
    const obj = JSON.parse(event.data);
    console.log(`Symbol: ${obj.s}`);
    console.log(`Ask Price: ${obj.a}`);

    const currentPrice = parseFloat(obj.a);
    if (sellPrice === 0 && currentPrice < 16000) {
        newOrder("0.01", "BUY");
        sellPrice = currentPrice * profitability;
    }
    else if (sellPrice !== 0 && currentPrice >= sellPrice) {
        newOrder("0.01", "SELL");
        sellPrice = 0;
    }
    else
        console.log("Waiting...");
}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side) {
    const data = {
        symbol: process.env.SYMBOL,
        side,
        type: 'MARKET',
        quantity,
        timestamp: Date.now(),
        recvWindow: 60000//máximo permitido, default 5000
    };

    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');

    const newData = { ...data, signature };
    const qs = `?${new URLSearchParams(newData)}`;

    try {
        const result = await axios({
            method: 'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': process.env.API_KEY }
        });
        console.log(result.data);
    } catch (err) {
        console.error(err);
    }
}
