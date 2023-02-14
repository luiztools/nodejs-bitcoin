const WebSocket = require('ws');
const ws = new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr");

const BOOK = {};

ws.onmessage = async (event) => {
    const arr = JSON.parse(event.data);
    arr.map(obj => BOOK[obj.s] = { price: parseFloat(obj.c) });
}

function getBook(symbol){
    return BOOK[symbol];
}

module.exports = {
    getBook
}