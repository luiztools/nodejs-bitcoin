//index.js
const axios = require("axios");

const Candlechart = require("./Candlechart");
const SYMBOL = "BTCUSDT";
const INTERVAL = "1h";
const LIMIT = 120;
const TICK_SIZE = 0.01;

async function start() {
    const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=${LIMIT}`);//5 dias
    const candlechart = new Candlechart(response.data, TICK_SIZE);

    let atl = candlechart.lowestPrice();
    let ath = candlechart.highestPrice();
    let medium = candlechart.getMedium(atl, ath);

    console.log("ATH: " + ath);
    console.log("ATL: " + atl);
    console.log("Medium: " + medium);

    const support = candlechart.findSupport(medium);
    console.log("Support: " + JSON.stringify(support));

    const resistance = candlechart.findResistance(medium);
    console.log("Resistance: " + JSON.stringify(resistance));
}

start();


