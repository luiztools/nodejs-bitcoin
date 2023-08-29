require("dotenv").config();
const { ethers } = require("ethers");

const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const WALLET = process.env.WALLET;
const TOKEN = process.env.TOKEN_ADDRESS;
const AMOUNT_TO_BUY = ethers.parseUnits(process.env.AMOUNT_TO_BUY, "ether");

let isOpened = false, isApproved = false;

const ABI_ROUTER = require("./abi.router.json");
const ABI_FACTORY = require("./abi.factory.json");
const ABI_ERC20 = require("./abi.erc20.json");

const provider = new ethers.InfuraProvider(process.env.NETWORK, process.env.INFURA_API_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function approve(tokenContract, amount) {
    const tx = await tokenContract.approve(ROUTER_ADDRESS, amount);
    console.log("Approving at " + tx.hash);
    await tx.wait();
}

async function swap(tokenIn, tokenOut, amountIn, fee) {
    const router = new ethers.Contract(ROUTER_ADDRESS, ABI_ROUTER, signer);

    const params = {
        tokenIn,
        tokenOut,
        fee,
        recipient: WALLET,
        deadline: Date.now() + 30000,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }

    const tx = await router.exactInputSingle(params, {
        from: WALLET,
        gasPrice: ethers.parseUnits('10', 'gwei'),
        gasLimit: 300000
    });
    console.log("Swapping at " + tx.hash);
    const receipt = await tx.wait();

    const amountOut = ethers.toBigInt(receipt.logs[0].data);
    console.log("Received " + ethers.formatUnits(amountOut, "ether"));

    return amountOut;
}

async function start() {
    if (!isApproved) {
        const token = new ethers.Contract(TOKEN, ABI_ERC20, signer);
        await approve(token, AMOUNT_TO_BUY);//approving buy
        isApproved = true;
    }

    const wsProvider = new ethers.WebSocketProvider(process.env.INFURA_WS_URL);
    const factory = new ethers.Contract(FACTORY_ADDRESS, ABI_FACTORY, wsProvider);

    factory.on("PoolCreated", async (token0, token1, fee, tickSpacing, pool) => {
        console.log('Snipe!');
        console.log(token0, token1, fee, tickSpacing, pool);

        if (!isOpened && token1 === TOKEN) {//tem que ser no quote/token1
            console.log("É negociado em WETH, bora comprar!");
            isOpened = true;
            const amountOut = await swap(TOKEN, token0, AMOUNT_TO_BUY, fee);
            console.log("Swap com sucesso!");

            const tokenContract = new ethers.Contract(token0, ABI_ERC20, signer);
            await approve(tokenContract, amountOut);//approving sell
            console.log("Aprovado para venda");
        }
    });

    setInterval(() => wsProvider.websocket.ping(), 60000);
    console.log("Esperando um pool ser criado!");
}

start();