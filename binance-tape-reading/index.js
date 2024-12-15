const axios = require("axios");

function findGreater(arr) {
    let bestIndex = 0;
    let bestValue = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > bestValue) {
            bestValue = arr[i];
            bestIndex = i;
        }
    }
    return bestIndex;
}

setInterval(async () => {
    const { data } = await axios.get("https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5000");
    console.clear();

    //apenas converte para float
    const bidsFloat = data.bids.map(b => [parseFloat(b[0]), parseFloat(b[1])]);
    const asksFloat = data.asks.map(a => [parseFloat(a[0]), parseFloat(a[1])]);

    //calcula o valor nominal
    const bidsNotional = bidsFloat.map(b => b[0] * b[1]);
    const asksNotional = asksFloat.map(a => a[0] * a[1]);

    //somatório dos valores nominais
    const bidsSum = bidsNotional.reduce((a, b) => a + b);
    const asksSum = asksNotional.reduce((a, b) => a + b);

    console.log("Bids: " + bidsSum);
    console.log("Asks: " + asksSum);

    let difference = 0;

    if (bidsSum > asksSum) {
        console.log("Força compradora vencendo, preço vai subir!");
        difference = (bidsSum * 100 / asksSum) - 100;
    }
    else {
        console.log("Força vendedora vencendo, preço vai cair!");
        difference = (asksSum * 100 / bidsSum) - 100;
    }
    console.log(difference.toFixed(2) + "%");

    const bestBuyIndex = findGreater(bidsNotional);
    console.log("Maior zona de compra: " + bidsFloat[bestBuyIndex]);

    const bestSellIndex = findGreater(asksNotional);
    console.log("Maior zona de venda: " + asksFloat[bestSellIndex]);
}, 3000)