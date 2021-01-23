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
    price = parseFloat(price);
    coin = isBuy ? 'brl' : coin.toLowerCase();

    const data = await tradeApi.getAccountInfo();
    let balance = parseFloat(data.balance[coin].available).toFixed(5);
    balance = parseFloat(balance);

    if (isBuy && balance < 50) return console.log('Sem saldo disponível para comprar!');
    console.log(`Saldo disponível de ${coin}: ${balance}`);

    if (isBuy) balance = parseFloat((balance / price).toFixed(5));
    return parseFloat(balance) - 0.00001;//tira a diferença que se ganha no arredondamento
}

setInterval(async () => {
    const response = await infoApi.ticker();
    console.log(response.ticker);
    if (response.ticker.sell > 170000)
        return console.log('Ainda muito alto, vamos esperar pra comprar depois.');

    try {
        const qty = await getQuantity('BRL', response.ticker.sell, true);
        const data = await tradeApi.placeBuyOrder(qty, response.ticker.sell);
        console.log('Ordem de compra inserida no livro. ', data);

        //operando em STOP de 3%
        const data2 = await tradeApi.placeSellOrder(data.quantity, response.ticker.sell * parseFloat(process.env.PROFITABILITY));
        console.log('Ordem de venda inserida no livro. ', data2);

    } catch (error) {
        console.error('Erro ao inserir ordem no livro. ', error);
    }
},
    process.env.CRAWLER_INTERVAL
)