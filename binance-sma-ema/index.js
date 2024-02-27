
require("dotenv").config();
const axios = require("axios");

const API_URL = process.env.API_URL;
const SYMBOL = process.env.SYMBOL;
const INTERVAL = process.env.INTERVAL;
const PERIOD = parseInt(process.env.PERIOD);

function SMA(closes){
  const sum = closes.reduce((a,b) => a + b);
  return sum / closes.length;
}

function smoothing(period){
  return 2 / (period + 1);
}

function EMA(closes, period = 20) {
  if (closes.length < period)  throw new Error("Não há dados suficientes para calcular o EMA.");

  const multiplier = smoothing(period);

  let prevEma = SMA(closes.slice(0, period));

  for (let i = period; i < closes.length; i++) {
    prevEma = (closes[i] - prevEma) * multiplier + prevEma;
  }

  return prevEma;
}

async function getCandles(){
  const response = await axios.get(`${API_URL}/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=1000`);
  const closes = response.data.map(k => parseFloat(k[4]));
  console.log("SMA: " + SMA(closes.slice(closes.length - PERIOD)));
  console.log("EMA: " + EMA(closes, PERIOD));
}

getCandles();
setInterval(getCandles, 3000);