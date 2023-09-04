require("dotenv").config();

const { INTERVAL, FACTORY_ADDRESS, QUOTER_ADDRESS, TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, NETWORK, INFURA_API_KEY } = process.env;

const { ChainId, Token } = require("@uniswap/sdk-core");
const WETH_TOKEN = new Token(ChainId.MAINNET, TOKEN_IN_ADDRESS, 18, 'WETH', 'Wrapped Ether');
const USDT_TOKEN = new Token(ChainId.MAINNET, TOKEN_OUT_ADDRESS, 6, 'USDT', 'Tether');

const { ethers } = require("ethers");
const provider = new ethers.InfuraProvider(NETWORK, INFURA_API_KEY);

function getTokenOrder(tokenIn, tokenOut) {
    if (ethers.toBigInt(tokenIn) <= ethers.toBigInt(tokenOut))
        return { token0: tokenIn, token1: tokenOut };
    else
        return { token0: tokenOut, token1: tokenIn };
}

async function preparationCycle() {

    const { computePoolAddress, FeeAmount } = require("@uniswap/v3-sdk")
    const currentPoolAddress = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: WETH_TOKEN,
        tokenB: USDT_TOKEN,
        fee: FeeAmount.MEDIUM,
    })

    const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
    const poolContract = new ethers.Contract(currentPoolAddress, IUniswapV3PoolABI.abi, provider);

    const result = getTokenOrder(TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS);
    result.fee = await poolContract.fee();
    
    return result;
}

async function executionCycle(token0, token1, fee) {
    const Quoter = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
    const quoterContract = new ethers.Contract(QUOTER_ADDRESS, Quoter.abi, provider);
    const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
        token0,
        token1,
        fee,
        ethers.parseEther("1"),
        0
    )

    console.log("WETH 1 is equals to USDT " + ethers.formatUnits(quotedAmountOut, 6));
}

(async () => {
    const { token0, token1, fee } = await preparationCycle();

    setInterval(() => executionCycle(token0, token1, fee), INTERVAL);

    executionCycle(token0, token1, fee);
})();