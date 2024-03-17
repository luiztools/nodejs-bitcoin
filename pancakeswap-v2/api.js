const { ethers } = require('ethers');
const axios = require('axios');

//WBNB Testnet
const WBNB_CONTRACT = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

//WBNB Mainnet
//const WBNB_CONTRACT="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

//pancake testnet
//FACTORY_CONTRACT=0x6725F303b657a9451d8BA641348b6761A6CC7a17
const ROUTER_CONTRACT = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

//pancake mainet
//const ROUTER_CONTRACT="0x10ED43C718714eb63d5aA57B78B54704E256024E";

const USDT_MAINNET = "0x55d398326f99059fF775485246999027B3197955";

async function getPrice(contract) {
    const { data } = await axios.get(
        `https://bsc.api.0x.org/swap/v1/price?sellToken=${contract}&buyToken=${USDT_MAINNET}&sellAmount=1000000000000000000`,
        {
            headers: { "0x-api-key": process.env.API_KEY }
        });
    return parseFloat(data.price);
}

let provider;
function getProvider() {
    if (!provider)
        provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

    return provider;
}

let walletInstance;
function getWallet() {
    if (!walletInstance) {
        const provider = getProvider();
        const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC);
        walletInstance = wallet.connect(provider);
    }

    return walletInstance;
}

async function getBalance(walletAddress, contractAddress, decimals = 18) {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, ["function balanceOf(address) view returns (uint)"], provider);
    const balance = await contract.balanceOf(walletAddress)
    return ethers.formatUnits(balance, decimals);
}

async function getTransaction(hash) {
    const provider = getProvider();
    return provider.getTransactionReceipt(hash);
}

async function swapFromBNB(walletAddress, tokenContract, bnbToSpend) {

    const account = getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.parseEther(bnbToSpend).toString();

    const gasPrice = ethers.parseUnits('10', 'gwei');

    return contract.swapExactETHForTokens(0, [
        WBNB_CONTRACT,
        tokenContract
    ],
        walletAddress,
        Date.now() + 10000,//prazo para ordem ser concluída
        {
            gasPrice,
            gasLimit: 300000,
            value
        });
}

async function swapTokens(wallet, tokenFrom, quantity, tokenTo) {

    const account = getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.parseEther(quantity).toString();

    await approve(tokenFrom, value);

    const gasPrice = ethers.parseUnits('10', 'gwei');

    return contract.swapExactTokensForTokens(value, 0, [
        tokenFrom,
        tokenTo
    ],
        wallet,
        Date.now() + 10000,//prazo para ordem ser concluída
        {
            gasPrice,
            gasLimit: 250000
        });
}

async function swapToBNB(walletAddress, tokenContract, amountIn) {

    const account = getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.parseEther(amountIn).toString();

    await approve(tokenContract, value);

    const gasPrice = ethers.parseUnits('10', 'gwei');

    return contract.swapExactTokensForETH(value, 0, [
        tokenContract,
        WBNB_CONTRACT
    ],
        walletAddress,
        Date.now() + 10000,//prazo para ordem ser concluída
        {
            gasPrice,
            gasLimit: 300000
        });
}

async function approve(tokenToSend, quantity) {
    const account = getWallet();
    const contract = new ethers.Contract(
        tokenToSend,
        ["function approve(address _spender, uint256 _value) public returns (bool success)"],
        account
    );

    return contract.approve(ROUTER_CONTRACT, quantity);
}

module.exports = {
    getPrice,
    getTransaction,
    getBalance,
    swapFromBNB,
    swapToBNB,
    swapTokens
}