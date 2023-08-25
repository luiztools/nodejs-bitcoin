require("dotenv").config();

const Moralis = require("moralis").default;

const { EvmChain } = require("@moralisweb3/common-evm-utils");

async function getPrice(){
    const price = await Moralis.EvmApi.token.getTokenPrice({
        address: process.env.TOKEN_ADDRESS,
        chain: EvmChain.ETHEREUM,
        exchange: process.env.EXCHANGE
    })
    console.log("USD " + price.result.usdPrice);
}

async function start() {
    await Moralis.start({ apiKey: process.env.API_KEY });
    await getPrice();
    
    setInterval(getPrice, process.env.INTERVAL)
}

start();