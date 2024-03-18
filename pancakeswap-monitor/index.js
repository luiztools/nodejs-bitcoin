require("dotenv").config();
const { ethers } = require("ethers");

const { INTERVAL, FACTORY_ADDRESS, QUOTER_ADDRESS, TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, PROVIDER_URL } = process.env;

const { Token } = require("@pancakeswap/swap-sdk-core");
const { ChainId } = require("@pancakeswap/chains");

const WBNB_TOKEN = new Token(ChainId.BSC, TOKEN_IN_ADDRESS, 18, 'WBNB', 'Wrapped BNB');
const USDT_TOKEN = new Token(ChainId.BSC, TOKEN_OUT_ADDRESS, 18, 'USDT', 'Tether');

const QUOTER_ABI = require("./Quoter.abi.json");
const POOL_ABI = require("./Pool.abi.json");

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

async function preparationCycle() {

  const { computePoolAddress, FeeAmount } = require("@pancakeswap/v3-sdk");
  const currentPoolAddress = computePoolAddress({
    deployerAddress: FACTORY_ADDRESS,
    tokenA: WBNB_TOKEN,
    tokenB: USDT_TOKEN,
    fee: FeeAmount.LOWEST
  })

  const result = { tokenIn: TOKEN_IN_ADDRESS, tokenOut: TOKEN_OUT_ADDRESS };
  const poolContract = new ethers.Contract(currentPoolAddress, POOL_ABI, provider);
  result.fee = await poolContract.fee();

  return result;
}

async function executionCycle(tokenIn, tokenOut, fee) {

  const quoterContract = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);

  const [amountOut] = await quoterContract.quoteExactInputSingle.staticCall({
    tokenIn,
    tokenOut,
    fee,
    amountIn: ethers.parseEther("1"),
    sqrtPriceLimitX96: 0
  })

  console.log("WBNB 1 is equals to USDT " + ethers.formatUnits(amountOut, 18));
}

(async () => {
  const { tokenIn, tokenOut, fee } = await preparationCycle();

  setInterval(() => executionCycle(tokenIn, tokenOut, fee), INTERVAL);

  executionCycle(tokenIn, tokenOut, fee);
})();