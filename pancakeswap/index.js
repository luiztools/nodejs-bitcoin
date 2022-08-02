//index.js
const { swapToBNB, swapFromBNB } = require('./api');

//carteira de quem vai negociar
const WALLET = process.env.PUBLIC_KEY;

const USDC = "0x64544969ed7EBf5f083679233325356EbE738930";//testnet


//BNB > USDC
swapToBNB(WALLET, USDC, '5')
    .then(result => console.log(result))
    .catch(err => console.error(err));

    //PancakeSwap Testnet
    //https://pancake.kiemtienonline360.com/#/swap