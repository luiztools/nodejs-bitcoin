const { ethers } = require('ethers');
const axios = require('axios');

async function getPrice(contract) {
    //{"updated_at":1651872520555,"data":{"name":"Tether USD","symbol":"USDT","price":"0.99972238262078029276683259597","price_BNB":"0.002625642537367571341001321609518"}}
    const { data } = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${contract}`);
    return parseFloat(data.data.price);
}

// const TOKEN_ABI = [
//     "function name() view returns (string)",
//     "function symbol() view returns (string)",
//     "function balanceOf(address) view returns (uint)",
//     "function decimals() public view returns (uint8)",
//     "function totalSupply() public view returns (uint256)",
//     "function transfer(address to, uint amount)",
//     "event Transfer(address indexed from, address indexed to, uint amount)"
// ];

async function getBalance(address, contractAddress, decimals = 18) {
    const provider = await getProvider();
    const contract = new ethers.Contract(contractAddress, ["function balanceOf(address) view returns (uint)"], provider);
    const balance = await contract.balanceOf(address)
    return ethers.utils.formatUnits(balance, decimals);
}

async function getTransaction(hash) {
    const provider = await getProvider();
    const tx = await provider.getTransactionReceipt(hash);
    return tx;
}

let provider;
async function getProvider() {
    if (!provider)
        provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

    return provider;
}

let walletInstance;
async function getWallet() {
    if (!walletInstance) {
        const provider = await getProvider();
        const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
        walletInstance = wallet.connect(provider);
    }

    return walletInstance;
}

async function swapFromBNB(walletAddress, tokenToReceive, bnbToSpend) {

    const account = await getWallet();
    const contract = new ethers.Contract(
        process.env.ROUTER_CONTRACT,
        ["function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.utils.parseEther(bnbToSpend).toHexString();
    const gasPrice = ethers.utils.parseUnits('10', 'gwei');

    const tx = await contract.swapExactETHForTokens(0, [
        process.env.WBNB_CONTRACT,
        tokenToReceive
    ],
        walletAddress,
        Date.now() + 10000,//prazo para ordem ser concluída
        {
            gasPrice,
            gasLimit: 300000,
            value
        });

    return tx;
}

async function swapToBNB(walletAddress, tokenToSend, tokenToSpend) {

    const account = await getWallet();
    const contract = new ethers.Contract(
        process.env.ROUTER_CONTRACT,
        ["function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.utils.parseEther(tokenToSpend).toHexString();
    const gasPrice = ethers.utils.parseUnits('10', 'gwei');

    const tx = await contract.swapExactTokensForETH(tokenToSpend, 0, [
        tokenToSend,
        process.env.WBNB_CONTRACT
    ],
        walletAddress,
        Date.now() + 10000,//prazo para ordem ser concluída
        {
            gasPrice,
            gasLimit: 300000,
            value
        });

    return tx;
}

module.exports = {
    getPrice,
    getTransaction,
    getBalance,
    swapFromBNB,
    swapToBNB
}