const axios = require("axios");
const createHmac = require("crypto-js/hmac-sha384");

function ticker(base = 'BTC', quote = 'BRL') {
    return call(`ticker?base=${base}&quote=${quote}`);
}

function meta() {
    return call('meta');
}

function balance() {
    return call("balance", null, "POST");
}

function offer(amount, op, base = "BTC") {
    const isQuote = op === 'buy' ? true : false;
    return call("offer", { amount, op, isQuote, base, quote: "BRL" }, "POST");
}

function confirmOffer(offerId) {
    return call("offer/confirm", { offerId }, "POST");
}

function sign(endpoint, nonce, data) {
    const strToBeSigned = `v1/${endpoint}${nonce}${data}`;
    const hashBuffer = Buffer.from(strToBeSigned).toString("base64");

    return createHmac(hashBuffer, process.env.API_SECRET).toString();
}

async function call(endpoint, params, method = 'GET') {
    const headers = { "Content-Type": "application/json" };

    const url = `https://api.biscoint.io/v1/${endpoint}`;
    let data = undefined;

    if (method === 'POST') {
        params = params || {};
        data = JSON.stringify(params, Object.keys(params).sort());

        const nonce = `${Date.now() * 1000}`;
        const signedParams = sign(endpoint, nonce, data);

        headers["BSCNT-NONCE"] = nonce;
        headers["BSCNT-APIKEY"] = `${process.env.API_KEY}`;
        headers["BSCNT-SIGN"] = signedParams;

        data = JSON.parse(data);
    }

    const config = {
        url,
        method,
        headers,
        data,
        timeout: 5000
    }

    const result = await axios(config);
    return result.data;
}

module.exports = {
    meta,
    ticker,
    balance,
    offer,
    confirmOffer
}
