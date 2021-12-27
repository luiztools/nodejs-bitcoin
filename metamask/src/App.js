import { useState } from 'react';
import { ethers } from 'ethers';

function App() {

  const [myAddress, setMyAddress] = useState("");
  const [balance, setBalance] = useState('');

  const [toAddress, setToAddress] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState('');

  async function connect() {
    if (!window.ethereum)
      return setMessage('No MetaMask');

    setMessage(`Trying to connect and load balance...`);

    await window.ethereum.send('eth_requestAccounts');

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const balance = await provider.getBalance(myAddress);
    setBalance(ethers.utils.formatEther(balance.toString()));
    setMessage(``);
  }

  async function transfer() {

    if (!window.ethereum)
      return setMessage('No MetaMask');

    setMessage(`Trying to transfer ${quantity} to ${toAddress}...`);

    await window.ethereum.send('eth_requestAccounts');

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();
    ethers.utils.getAddress(toAddress);//valida endereço

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(quantity)
    })

    setMessage(JSON.stringify(tx));
  }

  return (
    <div>
      <p>
        My Address : <input type="text" onChange={evt => setMyAddress(evt.target.value)} />
        <input type="button" value="Connect" onClick={evt => connect()} />
      </p>
      <p>
        Balance (BNB): {balance}
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
        {message}
      </p>
    </div >
  );
}

export default App;
