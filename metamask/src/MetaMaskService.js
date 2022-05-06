import { ethers } from 'ethers';

/**
 * 
function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
function approve(address _spender, uint256 _value) public returns (bool success)
function allowance(address _owner, address _spender) public view returns (uint256 remaining)
 */

const CONTRACT_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
    "function transfer(address to, uint amount)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

async function getMetaMaskProvider() {
    if (!window.ethereum) throw new Error(`No MetaMask found!`);
    await window.ethereum.send('eth_requestAccounts');

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) window.location.reload();
    });
    return provider;
}

export async function getBnbBalance(address) {

    const provider = await getMetaMaskProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance.toString());
}

export async function transferBnb(toAddress, quantity) {

    const provider = await getMetaMaskProvider();
    const signer = provider.getSigner();
    ethers.utils.getAddress(toAddress);//valida endereço

    const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(quantity)
    })

    return tx;
}

export async function getTokenBalance(address, contractAddress, decimals = 18) {

    const provider = await getMetaMaskProvider();
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    const balance = await contract.balanceOf(address)

    return ethers.utils.formatUnits(balance, decimals);
}

export async function transferToken(toAddress, contractAddress, quantity, decimals = 18) {

    const provider = await getMetaMaskProvider();
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    const contractSigner = contract.connect(signer);

    ethers.utils.getAddress(toAddress);//valida endereço

    const tx = await contractSigner.transfer(toAddress, ethers.utils.parseUnits(quantity, decimals));

    return tx;
}

export async function getTransaction(hash){
    const provider = await getMetaMaskProvider();
    const tx = await provider.getTransactionReceipt(hash);
    return tx;
}