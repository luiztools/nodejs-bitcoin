require('dotenv').config();
const api = require('./api');

const SYMBOL = process.env.SYMBOL || 'BTC:BRL';
const CRAWLER_INTERVAL = process.env.CRAWLER_INTERVAL || 3000;

async function tick() {

    // const data = await api.getTicker(SYMBOL);
    // const price = data.ask;
    // console.log(`Price: ${price}`);

    const data = await api.getBalance(SYMBOL);
    console.log(data);

    setTimeout(() => {
        tick();
    }, CRAWLER_INTERVAL)
}

tick();