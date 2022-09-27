const express = require('express');

const app = express();
const path = require('path');

const api = require('./api');
const profitability = parseFloat(process.env.PROFITABILITY);
const symbol = process.env.SYMBOL;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/data', async (req, res) => {

    const data = {};

    const mercado = await api.depth(symbol);
    data.buy = mercado.bids.length ? mercado.bids[0][0] : 0;
    data.sell = mercado.asks.length ? mercado.asks[0][0] : 0;

    const carteira = await api.accountInfo();
    const coins = carteira.balances.filter(b => symbol.indexOf(b.asset) !== -1);
    data.coins = coins;

    const sellPrice = parseFloat(mercado.asks[0][0]);
    const carteiraUSD = parseFloat(coins.find(c => c.asset.endsWith('USD')).free);

    if (sellPrice < 100) {
        console.log('Preço está bom. Verificando se tenho grana...');
        if (sellPrice <= carteiraUSD) {

            console.log('Tenho! Comprando!');
            const buyOrder = await api.newOrder(symbol, 1);
            data.buyOrder = { id: buyOrder.orderId, status: buyOrder.status };

            console.log(`Posicionando venda. Ganho de ${profitability}`);
            const sellOrder = await api.newOrder(symbol, 1, sellPrice * profitability, 'SELL', 'LIMIT');
            data.sellOrder = { id: sellOrder.orderId, status: sellOrder.status };
        }
    }

    res.json(data);
})

app.use('/', (req, res) => {
    res.render('app', { symbol, profitability, lastUpdate: new Date(), interval: process.env.CRAWLER_INTERVAL });
})

app.listen(process.env.PORT, () => {
    console.log(`Aplicação rodando!`);
});