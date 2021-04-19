//index.js
require("dotenv-safe").config();
const { MercadoBitcoin, MercadoBitcoinTrade } = require("./api");

const infoApi = new MercadoBitcoin({ currency: 'BTC' });

const tradeApi = new MercadoBitcoinTrade({
    currency: 'BTC',
    key: process.env.KEY,
    secret: process.env.SECRET,
    pin: process.env.PIN
});

async function getQuantity(coin, price, isBuy) {
    coin = isBuy ? 'brl' : coin.toLowerCase();

    const data = await tradeApi.getAccountInfo();
    const balance = parseFloat(data.balance[coin].available).toFixed(8);
    if (!isBuy) return balance;

    if (balance < 100) return false;
    console.log(`Saldo disponível de ${coin}: ${balance}`);

    price = parseFloat(price);
    let qty = parseFloat((balance / price).toFixed(8));
    return qty - 0.00000001;//tira a diferença que se ganha no arredondamento
}

setInterval(async () => {
    const response = await infoApi.ticker();
    console.log(response.ticker);
    if (response.ticker.sell > 333000)
        return console.log('Ainda muito alto, vamos esperar pra comprar depois.');

    try {
        const qty = await getQuantity('BRL', response.ticker.sell, true);
        if (!qty) return console.log('Saldo insuficiente para comprar!');

        const data = await tradeApi.placeBuyOrder(qty, response.ticker.sell);
        console.log('Ordem de compra inserida no livro. ', data);

        const buyPrice = parseFloat(response.ticker.sell);
        const profitability = parseFloat(process.env.PROFITABILITY);//10% = 1.1
        const sellQty = await getQuantity('BTC', 1, false);
        const data2 = await tradeApi.placeSellOrder(sellQty, buyPrice * profitability);
        console.log('Ordem de venda inserida no livro. ', data2);

    } catch (error) {
        console.error('Erro ao inserir ordem no livro. ', error);
    }
},
    process.env.CRAWLER_INTERVAL
)