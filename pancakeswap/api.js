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

async function getPrice(contract) {
    //another form to get price
    //https://bsc.api.0x.org/swap/v1/quote?buyToken=BUSD&sellToken=0xacFC95585D80Ab62f67A14C566C1b7a49Fe91167&sellAmount=1000000000000000000&excludedSources=BakerySwap,Belt,DODO,DODO_V2,Ellipsis,Mooniswap,MultiHop,Nerve,SushiSwap,Smoothy,ApeSwap,CafeSwap,CheeseSwap,JulSwap,LiquidityProvider&slippagePercentage=0&gasPrice=0
    //{"updated_at":1651872520555,"data":{"name":"Tether USD","symbol":"USDT","price":"0.99972238262078029276683259597","price_BNB":"0.002625642537367571341001321609518"}}
    const { data } = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${contract}`);
    return parseFloat(data.data.price);//preço em dólar
}

async function getBalance(walletAddress, contractAddress, decimals = 18) {
    const provider = await getProvider();
    const contract = new ethers.Contract(contractAddress, ["function balanceOf(address) view returns (uint)"], provider);
    const balance = await contract.balanceOf(walletAddress)
    return ethers.utils.formatUnits(balance, decimals);
}

async function getTransaction(hash) {
    const provider = await getProvider();
    return provider.getTransactionReceipt(hash);
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

async function swapFromBNB(walletAddress, tokenContract, bnbToSpend) {

    const account = await getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.utils.parseEther(bnbToSpend).toHexString();

    const gasPrice = ethers.utils.parseUnits('10', 'gwei');

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

    const account = await getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.utils.parseEther(quantity).toHexString();

    await approve(tokenFrom, value);

    const gasPrice = ethers.utils.parseUnits('10', 'gwei');

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

    const account = await getWallet();
    const contract = new ethers.Contract(
        ROUTER_CONTRACT,
        ["function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"],
        account);

    const value = ethers.utils.parseEther(amountIn).toHexString();

    await approve(tokenContract, value);

    const gasPrice = ethers.utils.parseUnits('10', 'gwei');

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
    const account = await getWallet();
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