const axios = require('axios');
const crypto = require('crypto');

const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;

async function newOrder(symbol, quantity, side = 'BUY', type = 'MARKET', price = 0) {
    const data = { symbol, side, type, quantity };

    if (price) data.price = parseInt(price);
    if (type === 'LIMIT') data.timeInForce = 'GTC';

    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const timestamp = Date.now();
    const recvWindow = 60000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams({ ...data, timestamp, recvWindow }).toString()}`)
        .digest('hex');

    const newData = { ...data, timestamp, recvWindow, signature };
    const qs = `?${new URLSearchParams(newData).toString()}`;

    const result = await axios({
        method: 'POST',
        url: `${apiUrl}/v1/order${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
    });
    return result.data;
}

async function accountInfo() {

    if (!apiKey || !apiSecret)
        throw new Error('Preencha corretamente sua API KEY e SECRET KEY');

    const timestamp = Date.now();
    const recvWindow = 60000;//máximo permitido, default 5000

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(`${new URLSearchParams({ timestamp, recvWindow }).toString()}`)
        .digest('hex');

    const newData = { timestamp, recvWindow, signature };
    const qs = `?${new URLSearchParams(newData).toString()}`;

    const result = await axios({
        method: 'GET',
        url: `${apiUrl}/v2/account${qs}`,
        headers: { 'X-MBX-APIKEY': apiKey }
    });

    const data = { ...result.data };

    data.assets = result.data.assets.filter(item => parseFloat(item.availableBalance) > 0).map(item => {
        return { asset: item.asset, balance: item.availableBalance }
    });

    data.positions = result.data.positions.filter(item => parseFloat(item.positionAmt) !== 0);

    return data;
}

module.exports = {
    newOrder,
    accountInfo
}