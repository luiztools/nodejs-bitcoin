const axios = require('axios');
const { ec } = require('elliptic');
const { createHash } = require('crypto');
const urlencode = require('urlencode');
const algorithm = new ec('ed25519');

const apiKey = process.env.PUBLIC_KEY;
const secret = process.env.PRIVATE_KEY;

const BASE_ENDPOINT = 'https://api.liqi.com.br/exchange/v1';

async function getTicker(symbol) {
    const { data } = await axios.get(`${BASE_ENDPOINT}/fetchTicker?symbol=${symbol}`);
    return data;
}

async function getBalance(symbol) {
    const timestamp = + new Date;
    const recvWindow = 5000;
    const query = urlencode.stringify({ timestamp, recvWindow, symbol });

    const clientFromPriv = algorithm.keyFromPrivate(secret, "hex");
    const hash = createHash('sha256').update(query).digest('hex');
    const signature = clientFromPriv.sign(hash).toDER("hex");

    try {
        const { data } = await axios.get(`${BASE_ENDPOINT}/fetchBalance?${query}`, {
            headers: {
                'X-MBX-APIKEY': apiKey,
                'signature': signature
            }
        });
        return data;
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}

module.exports = {
    getTicker,
    getBalance
}