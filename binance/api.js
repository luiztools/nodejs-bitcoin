const axios = require('axios');
const queryString = require('querystring');

const crypto = require('crypto');
const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;

async function accountInfo() {
    return privateCall('/v3/account');
}

async function newOrder(symbol, quantity, price, side = 'BUY', type = 'MARKET') {
    const data = { symbol, side, type, quantity };

    if (price) data.price = parseInt(price);
    if (type === 'LIMIT') data.timeInForce = 'GTC';

    return privateCall('/v3/order', data, 'POST');
}

async function privateCall(path, data = {}, method = 'GET') {
    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const timestamp = Date.now();

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${queryString.stringify({ ...data, timestamp })}`)
        .digest('hex');

    const newData = { ...data, timestamp, signature };
    const qs = `?${queryString.stringify(newData)}`;

    try {
        const result = await axios({
            method,
            url: `${apiUrl}${path}${qs}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        return result.data;
    } catch (err) {
        console.log(err);
    }
}

async function publicCall(path, data, method = 'GET') {
    try {
        const qs = data ? `?${queryString.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${process.env.API_URL}${path}${qs}`
        });
        return result.data;
    } catch (err) {
        console.error(err);
    }
}

async function ping() {
    return publicCall('/v3/ping');
}

async function time() {
    return publicCall('/v3/time');
}

async function depth(symbol = 'BTCBRL', limit = 5) {
    return publicCall('/v3/depth', { symbol, limit });
}

async function exchangeInfo(symbol) {
    const result = await publicCall('/v3/exchangeInfo');
    return symbol ? result.symbols.find(s => s.symbol === symbol) : result.symbols;
}

module.exports = { ping, time, depth, exchangeInfo, accountInfo, newOrder }