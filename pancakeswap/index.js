//index.js
const api = require('./api');

//carteira de quem vai negociar
const WALLET = process.env.WALLET;
const PRICE_TO_BUY = 1;
const PROFITABILITY = 1.1;//10%
const CRAWLER_INTERVAL = 3000;

const USDC = "0x64544969ed7EBf5f083679233325356EbE738930";//testnet
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";//testnet
const CAKE = "0xf9f93cf501bfadb6494589cb4b4c15de49e85d0e";//testnet
const BUSD = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee";//testnet


setInterval(async () => {
    const price = await getPrice(CAKE);
    console.log(price);
    if (price < PRICE_TO_BUY) {
        console.log("Cheap. Time to buy.");
        api.swapTokens(WALLET, BUSD, '10', CAKE)//change 10 BUSD for as many CAKES as possible
            .then(result => console.log(result))
            .catch(err => console.error(err));
    }
    else if (price > (PRICE_TO_BUY * PROFITABILITY)) {
        console.log("Expensive. Time to sell.");
        api.swapTokens(WALLET, CAKE, '10', BUSD)//change 10 CAKE for as many BUSD as possible
            .then(result => console.log(result))
            .catch(err => console.error(err));
    }
}, CRAWLER_INTERVAL)

//BUSD > BNB
// api.swapToBNB(WALLET, BUSD, '5')
//     .then(result => console.log(result))
//     .catch(err => console.error(err));

// api.getBalance(WALLET, USDC, 18)
// .then(result => console.log(result))
//     .catch(err => console.error(err));

//BNB > BUSD
// api.swapFromBNB(WALLET, BUSD, '0.1')
//     .then(result => console.log(result))
//     .catch(err => console.error(err));

//BUSD > USDC
// api.swapTokens(WALLET, BUSD, '1', USDC)
//     .then(result => console.log(result))
//     .catch(err => console.error(err));

//PancakeSwap Testnet
//https://pancake.kiemtienonline360.com/#/swap
//https://amm.kiemtienonline360.com/