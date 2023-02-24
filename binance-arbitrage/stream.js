const WebSocket = require('ws');

const ws = new WebSocket(`${process.env.STREAM_URL}/!miniTicker@arr`);

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