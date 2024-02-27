//index.js
const axios = require("axios");

const API_URL = process.env.API_URL;
const SYMBOL = process.env.SYMBOL;
const INTERVAL = process.env.INTERVAL;
const PERIOD = parseInt(process.env.PERIOD);

function RSI(closes, period = 14) {
    if (closes.length < (period + 1)) throw new Error(`Invalid period for closes length`);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0)
            gains += diff;
        else
            losses -= diff;
    }

    const strength = gains / losses;
    return 100 - (100 / (1 + strength));
}


async function getCandles() {
    const response = await axios.get(`${API_URL}/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=${PERIOD + 1}`);
    const closes = response.data.map(k => parseFloat(k[4]));
    const rsi = RSI(closes, PERIOD);
    console.log(rsi);
}

setInterval(getCandles, 3000);