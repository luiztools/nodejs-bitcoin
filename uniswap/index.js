require("dotenv").config();
const { ethers } = require("ethers");
const Moralis = require("moralis").default;

const { EvmChain } = require("@moralisweb3/common-evm-utils");

const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
const WALLET = process.env.WALLET;
const TOKEN0 = process.env.TOKEN0_ADDRESS;
const TOKEN1 = process.env.TOKEN1_ADDRESS;
const PRICE_TO_BUY = parseFloat(process.env.PRICE_TO_BUY);
const AMOUNT_TO_BUY = ethers.parseUnits(process.env.AMOUNT_TO_BUY, "ether");
const PRICE_TO_SELL = PRICE_TO_BUY * parseFloat(process.env.PROFITABILITY);

let isOpened = false, isApproved = false, amountOut = 0;

const ABI_UNISWAP = require("./abi.uniswap.json");
const ABI_ERC20 = require("./abi.erc20.json");

const provider = new ethers.InfuraProvider(process.env.NETWORK, process.env.INFURA_API_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const router = new ethers.Contract(ROUTER_ADDRESS, ABI_UNISWAP, signer);
const token0 = new ethers.Contract(TOKEN0, ABI_ERC20, signer);
const token1 = new ethers.Contract(TOKEN1, ABI_ERC20, signer);

async function getPrice() {
    const { result } = await Moralis.EvmApi.token.getTokenPrice({
        address: TOKEN0,
        chain: EvmChain.GOERLI,
        exchange: "uniswapv3"
    })
    return result.usdPrice;
}

async function approve(tokenContract, amount) {
    const tx = await tokenContract.approve(ROUTER_ADDRESS, amount);
    console.log("Approving at " + tx.hash);
    await tx.wait();
}

async function swap(tokenIn, tokenOut, amountIn) {
    const params = {
        tokenIn,
        tokenOut,
        fee: 3000,//poolFee = 0.3% * 10000
        recipient: WALLET,
        deadline: (Date.now()/1000) + 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }

    const tx = await router.exactInputSingle(params, {
        from: WALLET,
        gasPrice: ethers.parseUnits('10', 'gwei'),
        gasLimit: 250000
    });
    console.log("Swapping at " + tx.hash);
    const receipt = await tx.wait();

    const amountOut = ethers.toBigInt(receipt.logs[0].data);
    console.log("Received " + ethers.formatUnits(amountOut, "ether"));

    return amountOut;
}

async function executeCycle() {
    const usdPrice = await getPrice();
    console.log("USD " + usdPrice);

    if (!isApproved) {
        await approve(token1, AMOUNT_TO_BUY);//approving buy
        isApproved = true;
    }

    if (usdPrice < PRICE_TO_BUY && !isOpened) {
        isOpened = true;
        amountOut = await swap(TOKEN1, TOKEN0, AMOUNT_TO_BUY);

        await approve(token0, amountOut);//approving sell
    }
    else if (isOpened && usdPrice > PRICE_TO_SELL) {
        isOpened = false;
        await swap(TOKEN0, TOKEN1, amountOut);

        amountOut = 0;
        isApproved = false;
    }
}

async function start() {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    await executeCycle();

    setInterval(executeCycle, process.env.INTERVAL);
}

start();