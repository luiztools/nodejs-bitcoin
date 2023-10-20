require("dotenv").config();

const AUTH_TOKEN = process.env.SIGNATURE + process.env.API_KEY;
const COINPAIR = process.env.COINPAIR;
const BUY_TRIGGER = parseFloat(process.env.BUY_TRIGGER);
const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
const SELL_TRIGGER = BUY_TRIGGER * PROFITABILITY;

let isOpened = false;
let amountToBuy = parseFloat(process.env.BUY_AMOUNT)
let amountToSell = 0;

const { Socket } = require('phoenix-channels')

const socket = new Socket(`wss://websocket.bitpreco.com/orderbook/socket`)
socket.connect();

socket.onOpen(() => console.log('Connected successfully'))
socket.onError(e => {
    console.error('Failed to connect to socket', e);
    process.exit(0);
})

const channel = socket.channel(`ticker:ALL-BRL`, {});
channel.join()
    .receive('ok', resp => console.log('Joined successfully', resp))
    .receive('error', resp => console.log('Unable to join', resp))

channel.on('price', payload => {
    console.clear();
    //console.log(payload);

    const coinPair = payload[COINPAIR];
    console.log(coinPair);
    console.log(`Is Opened? ${isOpened}`);

    if (!isOpened) {
        console.log(`Buy Trigger: ${BUY_TRIGGER}`);
        if (coinPair.sell <= BUY_TRIGGER) {
            isOpened = true;
            console.log("Comprar");
            buy()
                .catch(err => {
                    console.error(err);
                    process.exit(0);
                });
        }
    }
    else {
        console.log(`Sell Trigger: ${SELL_TRIGGER}`);
        if (coinPair.buy >= SELL_TRIGGER) {
            console.log("Vender");
            sell()
                .then(response => {
                    isOpened = false;
                    process.exit(0);
                })
                .catch(err => {
                    console.error(err);
                    process.exit(0);
                })
        }
    }
})

//compra/venda

const axios = require("axios");

async function buy() {
    const data = await call('buy', amountToBuy);
    console.log(data);
    amountToSell = data.exec_amount;
    return data;
}

async function sell() {
    const data = await call('sell', amountToSell);
    console.log(data);
    amountToBuy = data.exec_amount *  data.price;
    return data;
}

async function call(side, volume) {
    const url = `https://api.bitpreco.com/v1/trading/${side}`;

    const data = {
        market: COINPAIR,
        volume,
        limited: false,
        auth_token: AUTH_TOKEN
    }

    const result = await axios.post(url, data);
    return result.data;
}