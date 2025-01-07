//index.js
const SYMBOL = process.env.SYMBOL;
const INTERVAL = process.env.INTERVAL;
const PERIOD = parseInt(process.env.PERIOD);

function averages(closes, period, startIndex) {
    let gains = 0, losses = 0;

    for (let i = 0; i < period && (i + startIndex) < closes.length; i++) {
        const diff = closes[i + startIndex] - closes[i + startIndex - 1];

        if (diff >= 0)
            gains += diff;
        else
            losses += Math.abs(diff);
    }

    let avgGains = gains / period;
    let avgLosses = losses / period;
    return { avgGains, avgLosses };
}

function RSI(closes, period) {
    let { avgGains, avgLosses } = averages(closes, period, 1);
    
    for (let i = 2; i < closes.length; i++) {
        let newAverages = averages(closes, period, i);
        avgGains = (avgGains * (period - 1) + newAverages.avgGains) / period;
        avgLosses = (avgLosses * (period - 1) + newAverages.avgLosses) / period;
    }

    const rs = avgGains / avgLosses;
    return 100 - (100 / (1 + rs));
}


async function getCandles() {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=100`);
    const data = await response.json();
    const closes = data.map(k => parseFloat(k[4]));
    const rsi = RSI(closes, PERIOD);
    console.clear();
    console.log(rsi);
}

setInterval(getCandles, 3000);
