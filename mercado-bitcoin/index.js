require("dotenv").config();
const WebSocket = require("ws");
const axios = require('axios');

const BUY_QTY = process.env.BUY_QTY;
const BUY_PRICE = parseFloat(process.env.BUY_PRICE);
const PROFITABILITY = parseFloat(process.env.PROFITABILITY);

let sellPrice = 0;
let accessToken = "";

login();
//getAccountId();

const ws = new WebSocket("wss://ws.mercadobitcoin.net/ws");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        subscription: {
            name: "ticker",
            id: process.env.STREAM_ID
        }
    }));
}

ws.onmessage = (evt) => {
    console.clear();
    const obj = JSON.parse(evt.data);
    if (obj.type !== "ticker") return;

    console.log(obj.data);
    console.log("Sell Target: " + sellPrice);

    if (!sellPrice && parseFloat(obj.data.sell) <= BUY_PRICE) {
        sellPrice = parseFloat(obj.data.sell) * PROFITABILITY;
        newOrder(BUY_QTY, "buy");
    }
    else if (sellPrice && parseFloat(obj.data.buy) >= sellPrice) {
        newOrder(BUY_QTY, "sell");
    }
}

async function getAccountId() {
    const url = `https://api.mercadobitcoin.net/api/v4/accounts/`;
    const headers = { Authorization: "Bearer " + accessToken };
    const { data } = await axios.get(url, { headers });

    console.log(data);
    process.exit(0);
}

async function login() {
    const url = `https://api.mercadobitcoin.net/api/v4/authorize/`;
    const body = { login: process.env.API_KEY, password: process.env.API_SECRET };
    const { data } = await axios.post(url, body);

    accessToken = data.access_token;

    console.log("Acesso autorizado!");

    setTimeout(login, (data.expiration * 1000) - Date.now());
}

async function newOrder(qty, side = "buy") {
    const url = `https://api.mercadobitcoin.net/api/v4/accounts/${process.env.ACCOUNT_ID}/${process.env.SYMBOL}/orders`;
    const body = {
        qty,
        side,
        type: "market"
    }
    const headers = { Authorization: "Bearer " + accessToken };

    try {
        const { data } = await axios.post(url, body, { headers });

        if (side === "sell")
            sellPrice = 0;

        return data;
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        process.exit(0);
    }
}