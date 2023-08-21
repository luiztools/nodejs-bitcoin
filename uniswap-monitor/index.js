require("dotenv").config();

const Moralis = require("moralis").default;

const { EvmChain } = require("@moralisweb3/common-evm-utils");

async function start() {
    await Moralis.start({ apiKey: process.env.API_KEY });
    setInterval(async () => {
        const price = await Moralis.EvmApi.token.getTokenPrice({
            address: process.env.TOKEN_ADDRESS,
            chain: EvmChain.ETHEREUM,
            exchange: "uniswapv3"
        })
        console.log("USD " + price.result.usdPrice);
    }, process.env.INTERVAL)
}

start();