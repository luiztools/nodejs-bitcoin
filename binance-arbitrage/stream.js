const WebSocket = require('ws');
const ws = new WebSocket("wss://stream.binance.com:9443/ws/!bookTicker");

const BOOK = {};

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    BOOK[obj.s] = { ask: parseFloat(obj.a), bid: parseFloat(obj.b) }
}

function getBook(symbol){
    return BOOK[symbol];
}

module.exports = {
    getBook
}