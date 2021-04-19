const axios = require('axios');
const queryString = require('querystring');

async function publicCall(path, data, method = 'GET', headers = {}) {
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

async function exchangeInfo(symbol = 'BTCBRL') {
    const result = await publicCall('/v3/exchangeInfo');
    return result.symbols.find(s => s.symbol === symbol);
}

module.exports = { ping, time, depth, exchangeInfo }