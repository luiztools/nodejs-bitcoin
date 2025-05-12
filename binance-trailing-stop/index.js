require("dotenv").config();

const axios = require('axios');
const crypto = require('crypto');

const SYMBOL = "BTCUSDT";

async function orderRequest(method, data) {
    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');

    const newData = { ...data, signature };
    const qs = `?${new URLSearchParams(newData)}`;

    const result = await axios({
        method,
        url: `${process.env.API_URL}/v3/order${qs}`,
        headers: { 'X-MBX-APIKEY': process.env.API_KEY }
    });
    console.log(result.data);
    return result.data;
}

async function newOrder(symbol, quantity, side, trailingDelta) {
    //se stop price for usado, ele funciona como activation price
    const data = {
        symbol,
        side,
        type: side === "BUY" ? "STOP_LOSS" : "TAKE_PROFIT",
        quantity,
        trailingDelta,//substitui stop price (opcional), divide por 100
        timestamp: Date.now(),
        recvWindow: 60000//máximo permitido, default 5000
    };

    return orderRequest("POST", data);
}

//newOrder(SYMBOL, "0.001", "BUY", 100);

async function checkStatus(symbol, orderId, filledCallback) {
    const data = {
        symbol,
        orderId,
        timestamp: Date.now(),
        recvWindow: 60000//máximo permitido, default 5000
    };

    const orderStatus = await orderRequest("GET", data);
    if (orderStatus.status === "FILLED") {
        console.log("Order FILLED, executing next step.");
        filledCallback();
    }
    else {
        console.log("Not FILLED yet. Scheduling next check.")
        setTimeout(() => checkStatus(symbol, orderId, filledCallback), 60000);
    }
}

//checkStatus(SYMBOL, 295160, ()=> console.log("Finalizou!"));

async function startCycle() {
    console.log("Starting a new cycle!");
    const buyOrderReceipt = await newOrder(SYMBOL, "0.001", "BUY", 100);
    checkStatus(SYMBOL, buyOrderReceipt.orderId, async () => {
        const sellOrderReceipt = await newOrder(SYMBOL, "0.001", "SELL", 100);
        checkStatus(SYMBOL, sellOrderReceipt.orderId, startCycle);
    })
}

startCycle();

