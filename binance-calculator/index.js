require("dotenv").config();
const axios = require('axios');
const crypto = require('crypto');

const SYMBOL = process.env.SYMBOL;
const COMMISSION = process.env.BNB_COMMISSION === "true" ? 0.075 : 0;
const START_TIME = parseInt(process.env.START_TIME || 0);
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const API_URL = process.env.API_URL;

async function getAllOrders() {
    // rodando em modo simulado
    const mock = require("./mock.json");
    return  Promise.resolve(mock);

    // descomente o código abaixo para rodar de verdade
    // const data = {
    //     symbol: SYMBOL,
    //     limit: 1000,//máximo permitido
    //     timestamp: Date.now(),
    //     recvWindow: 60000//máximo permitido, default 5000
    // };

    // const signature = crypto
    //     .createHmac('sha256', API_SECRET)
    //     .update(`${new URLSearchParams(data)}`)
    //     .digest('hex');

    // const newData = { ...data, signature };
    // const qs = `?${new URLSearchParams(newData)}`;

    // try {
    //     const result = await axios({
    //         method: 'GET',
    //         url: `${API_URL}/api/v3/allOrders${qs}`,
    //         headers: { 'X-MBX-APIKEY': API_KEY }
    //     });
    //     return result.data;
    // } catch (err) {
    //     console.error(err);
    // }
}

async function calcAveragePrice() {
    const allOrders = await getAllOrders();

    const allBuyOrders = allOrders.filter(order => order.side === "BUY" && order.status === "FILLED" && order.workingTime > START_TIME);
    const totalBuyQuantity = allBuyOrders.map(order => parseFloat(order.executedQty)).reduce((a, b) => a + b);
    const totalBuyQuote = allBuyOrders.map(order => parseFloat(order.cummulativeQuoteQty)).reduce((a, b) => a + b);
    console.log(`Total Spent (${SYMBOL}): ${totalBuyQuote.toFixed(2)}`);
    console.log(`Number of Buys: ${allBuyOrders.length}`);
    const avgBuyPrice = totalBuyQuote / totalBuyQuantity;
    console.log(`Avg Buy Price (${SYMBOL}): ${avgBuyPrice.toFixed(2)}`);

    const allSellOrders = allOrders.filter(order => order.side === "SELL" && order.status === "FILLED" && order.workingTime > START_TIME);
    const totalSellQuantity = allSellOrders.map(order => parseFloat(order.executedQty)).reduce((a, b) => a + b);
    const totalSellQuote = allSellOrders.map(order => parseFloat(order.cummulativeQuoteQty)).reduce((a, b) => a + b);
    console.log(`Total Received (${SYMBOL}): ${totalSellQuote.toFixed(2)}`);
    console.log(`Number of Sells: ${allSellOrders.length}`);
    const avgSellPrice = totalSellQuote / totalSellQuantity;
    console.log(`Avg Sell Price (${SYMBOL}): ${avgSellPrice.toFixed(2)}`);

    const totalCommission = (allSellOrders.length + allBuyOrders.length) * COMMISSION;
    const quotePnL = (totalSellQuote - totalBuyQuote) * ((100 - totalCommission)/100);
    console.log(`Quote PnL (${SYMBOL}): ${quotePnL.toFixed(2)}`);

    const pnl = quotePnL * 100 / totalBuyQuote;
    console.log(`PnL (%): ${pnl.toFixed(2)}%`);
}

calcAveragePrice();