//index.js
const api = require('./api');

//carteira de quem vai negociar
const WALLET = process.env.WALLET;
const PRICE_TO_BUY = 1;
const PROFITABILITY = 1.1;//10%
const CRAWLER_INTERVAL = 3000;

const WBNB_TESTNET = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const CAKE_MAINNET = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const CAKE_TESTNET = "0xf9f93cf501bfadb6494589cb4b4c15de49e85d0e";

let isOpened = false;

setInterval(async () => {
    const price = await api.getPrice(CAKE_MAINNET);//só funciona pegar preço na mainnet
    console.log(price);
    if (price < PRICE_TO_BUY && !isOpened) {
        console.log("Cheap. Time to buy.");
        isOpened = true;
        api.swapTokens(WALLET, WBNB_TESTNET, '0.1', CAKE_TESTNET)//change 0.1 WBNB for as many CAKES as possible
            .then(result => console.log(result))
            .catch(err => console.error(err));
    }
    else if (price > (PRICE_TO_BUY * PROFITABILITY) && isOpened) {
        console.log("Expensive. Time to sell.");
        isOpened = false;
        api.swapTokens(WALLET, CAKE_TESTNET, '10', WBNB_TESTNET)//change 10 CAKE for as many WBNB as possible
            .then(result => console.log(result))
            .catch(err => console.error(err));
    }
}, CRAWLER_INTERVAL)

//token > BNB
// api.swapToBNB(WALLET, tokenAddress, '5')
//     .then(result => console.log(result))
//     .catch(err => console.error(err));

// api.getBalance(WALLET, tokenAddress, decimals)
// .then(result => console.log(result))
//     .catch(err => console.error(err));

//BNB > token
// api.swapFromBNB(WALLET, tokenAddress, '0.1')
//     .then(result => console.log(result))
//     .catch(err => console.error(err));

//PancakeSwap Testnet
//https://pancake.kiemtienonline360.com/#/swap
//https://amm.kiemtienonline360.com/
