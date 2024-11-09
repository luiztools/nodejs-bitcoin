const axios = require("axios");
const fs = require("fs");

const SYMBOL = "ETHUSDT";
const INTERVAL = "15m";
const FILENAME = `data/${SYMBOL}_${INTERVAL}.txt`;
const PROFITABILITY = 2;//%

async function downloadCandles(startTime) {
    if (startTime >= Date.now()) return;

    const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=1000&startTime=${startTime}`);
    const closes = response.data.map(k => k[4]).reduce((a, b) => a + "\n" + b);
    console.log(closes);

    if (fs.existsSync(FILENAME))
        fs.appendFileSync(FILENAME, "\n" + closes);
    else
        fs.writeFileSync(FILENAME, closes);

    await downloadCandles(response.data[response.data.length - 1][6] + 1);
}
downloadCandles(Date.now() - (365 * 24 * 60 * 60 * 1000));

async function doBacktest() {
    let closes = fs.readFileSync(FILENAME, { encoding: "utf-8" });
    closes = closes.split("\n").map(c => parseFloat(c));

    const firstCandle = closes[0];
    let orderPrice = firstCandle;
    let isOpened = true;
    let qtdSells = 0;
    let accPnl = 0;
    console.log(`Abriu e comprou no preço ${firstCandle}`);

    for (let i = 1; i < closes.length; i++) {
        const currentCandle = closes[i];

        const targetPrice = isOpened
            ? (orderPrice * (1 + (PROFITABILITY / 100)))
            : (orderPrice * (1 - (PROFITABILITY / 100)));

        const isLastCandle = i === closes.length - 1;
        if (isOpened) {
            if ((currentCandle >= targetPrice) || isLastCandle) {
                const pnl = ((currentCandle * 100) / orderPrice) - 100;
                accPnl += pnl;
                isOpened = false;
                orderPrice = currentCandle;
                qtdSells++;
                console.log(`Vendeu com ${pnl.toFixed(2)}% de lucro no preço: ${currentCandle}`);
            }
        }
        else if (!isOpened) {
            if (currentCandle <= targetPrice) {
                isOpened = true;
                console.log(`Comprou no preço ${currentCandle}`);
            }

            orderPrice = currentCandle;
        }
    }

    const lastCandle = closes[closes.length - 1];
    let holdPnl = ((lastCandle * 100) / firstCandle) - 100;

    console.log("Fechou no preço: " + lastCandle);
    console.log("Operações: ", qtdSells);
    console.log("PnL Trade %: ", accPnl);
    console.log("PnL Hold %: ", holdPnl);

}
//doBacktest();