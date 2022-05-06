import { useState } from 'react';
import { getTokenBalance, getBnbBalance, transferBnb, transferToken, getTransaction } from './MetaMaskService';

function App() {

  const [address, setAddress] = useState("0x9cd29e15d5647E702696c90D64dfB31425738c06");
  const [contract, setContract] = useState("BNB");
  const [balance, setBalance] = useState('');

  const [toAddress, setToAddress] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState('');
  const [transaction, setTransaction] = useState("0xb2c36a4b57c2c174ff3ce2c17720ace59c960ac82c6a8c11a7c6393ba4ffcb27");

  async function checkBalance() {
    let balance;

    if (contract === "BNB")
      balance = await getBnbBalance(address);
    else
      balance = await getTokenBalance(address, contract);

    setBalance(balance);
    setMessage(``);
  }

  async function checkTransaction() {
    const result = await getTransaction(transaction);
    setMessage(`
    Status: ${result.status}
    Confirmations: ${result.confirmations}`);
  }

  async function transfer() {
    let result;
    if (contract === "BNB")
      result = await transferBnb(toAddress, quantity);
    else
      result = await transferToken(toAddress, contract, quantity);

    setMessage(JSON.stringify(result));
  }

  return (
    <div>
      <p>
        My Address : <input type="text" onChange={evt => setAddress(evt.target.value)} value={address} />
      </p>
      <p>
        <select className="form-select" onChange={evt => setContract(evt.target.value)}>
          <option value="BNB">BNB</option>
          <option value="0x53598858bC64f5f798B3AcB7F82FF2CB2aF463bf">BTC</option>
          <option value="0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378">ETH</option>
          <option value="0x64544969ed7EBf5f083679233325356EbE738930">USDC</option>
        </select>
        <input type="button" value="See Balance" onClick={evt => checkBalance()} />
      </p>
      <p>
        Balance: {balance}
      </p>
      <hr />
      <p>
        To Address: <input type="text" onChange={evt => setToAddress(evt.target.value)} />
      </p>
      <p>
        Qty: <input type="text" onChange={evt => setQuantity(evt.target.value)} />
      </p>
      <p>
        <input type="button" value="Transfer" onClick={evt => transfer()} />
      </p>
      <hr />
      <p>
        Transaction: <input type="text" value={transaction} onChange={evt => setTransaction(evt.target.value)} />
        <input type="button" value="Check" onClick={evt => checkTransaction()} />
      </p>
      <p>
        {message}
      </p>
    </div >
  );
}

export default App;
