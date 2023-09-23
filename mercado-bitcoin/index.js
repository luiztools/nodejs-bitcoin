require("dotenv").config();
const WebSocket = require("ws");

const ws = new WebSocket("wss://ws.mercadobitcoin.net/ws");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        subscription: {
            name: "ticker",
            id: "BRLBTC"
        }
    }));
}

ws.onmessage = (evt) => {
    console.clear();
    console.log(JSON.parse(evt.data));
}