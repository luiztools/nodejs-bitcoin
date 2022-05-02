const axios = require('axios');

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_API_URL;

export async function getBnbBalance(address) {
    const url = `${BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`;
    const response = await axios.get(url);
    const balance = parseFloat(response.data.result) / 1000000000000000000;
    return balance;
}

export async function getTokenBalance(address, contract) {
    const url = `${BASE_URL}?module=account&action=tokenbalance&contractaddress=${contract}&address=${address}&tag=latest&apikey=${API_KEY}`;
    const response = await axios.get(url);
    const balance = parseFloat(response.data.result) / 1000000000000000000;
    return balance;
}

export async function getTransactionStatus(hash) {
    const url = `${BASE_URL}?module=transaction&action=gettxreceiptstatus&txhash=${hash}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    const status = response.data.result.status;
    if (!status || status !== '1') throw new Error(`Transaction not confirmed.`);
    return response.data;
}

export async function getContract(hash) {
    const url = `${BASE_URL}?module=contract&action=getsourcecode&address=${hash}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    const status = response.data.status;
    if (status !== '1') throw new Error(`Contract not found.`);
    return response.data.result;
}

export async function getBnbTransfers(address) {
    const url = `${BASE_URL}?module=account&action=txlist&address=${address}&apikey=${API_KEY}&sort=desc`;
    const response = await axios.get(url);
    const status = response.data.status;
    if (status !== '1') throw new Error(response.data.message);
    return response.data;
}

export async function getTokenTransfers(address) {
    const url = `${BASE_URL}?module=account&action=tokentx&address=${address}&apikey=${API_KEY}&sort=desc`;
    const response = await axios.get(url);
    const status = response.data.status;
    if (status !== '1') throw new Error(response.data.message);
    return response.data;
}