const axios = require("axios");

const readline = require("readline/promises");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
})

let allSymbols = {};

async function loadAllSymbols() {
    const { data } = await axios.get(`https://api.binance.com/api/v3/exchangeInfo`);
    for (let i = 0; i < data.symbols.length; i++) {
        const symbolObj = data.symbols[i];
        allSymbols[symbolObj.symbol] = { base: symbolObj.baseAsset, quote: symbolObj.quoteAsset };
    }
}

async function getSymbolQuotation(symbol, timestamp) {
    console.log("Loading quotation for " + symbol);
    const { data } = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1&startTime=${timestamp}`);
    return {
        time: data[0][0],
        price: parseFloat(data[0][4])
    }
}

const dollarcoins = ["USDT", "USDC", "DAI", "FDUSD", "TUSD"];

async function calcFiatPrice(symbolObj, fiat, cryptoPrice, timestamp) {
    //já é fiat, não precisa converter
    if (symbolObj.quote === fiat) {
        return cryptoPrice;
    }

    //pareado com alguma dollarcoin
    if (dollarcoins.some(sc => symbolObj.quote === sc)) {
        const fiatQuotation = await getSymbolQuotation("USDT" + fiat, timestamp);
        return fiatQuotation.price * cryptoPrice;
    }

    //outras criptos
    if(allSymbols[symbolObj.quote + fiat]){//se existe conversão direta
        const fiatQuotation = await getSymbolQuotation(symbolObj.quote + fiat, timestamp); 
        return fiatQuotation.price * cryptoPrice;   
    }

    //se não existe conversão direta, converte pra USDT primeiro
    const dollarQuotation = await getSymbolQuotation(symbolObj.quote + "USDT", timestamp);
    const fiatQuotation = await getSymbolQuotation("USDT" + fiat, timestamp);
    return dollarQuotation.price * fiatQuotation.price * cryptoPrice;
}

async function start() {
    console.clear();

    let symbol = await rl.question("Informe o par de moeda: ");
    symbol = symbol.toUpperCase();

    let fiat = await rl.question("Informe sua moeda fiat: ");
    fiat = fiat.toUpperCase();

    let date = await rl.question("Informe a data (yyyy-mm-dd): ");
    if (!/\d{4}-\d{2}-\d{2}/.test(date)) {
        console.error("Data inválida, o formato é yyyy-mm-dd!");
        process.exit(0);
    }

    date = Date.parse(date);

    console.clear();
    console.log(`Preço para ${symbol} em ${new Date(date)}: `);

    try {
        await loadAllSymbols();

        const symbolObj = allSymbols[symbol];
        const cryptoQuotation = await getSymbolQuotation(symbol, date);
        console.log(symbolObj.quote + " " + cryptoQuotation.price);

        const fiatPrice = await calcFiatPrice(symbolObj, fiat, cryptoQuotation.price, date);
        console.log(fiat + " " + fiatPrice.toFixed(2));
    } catch (err) {
        console.error(err.response ? err.response.data : err);
    }
    process.exit(0);
}

start();
