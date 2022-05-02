import { useState } from 'react';
import './App.css';
import { getTokenBalance, getBnbBalance, getContract, getTokenTransfers, getBnbTransfers } from './services/BscScanService';

function App() {

  const [search, setSearch] = useState({
    type: '1',
    token: '0x12Eb9ef44dE5fbea1b2F5Ff7A9a375cAe9bFB2eb',
    hash: ''
  })

  const [result, setResult] = useState();
  const [error, setError] = useState('');

  function cleaner() {
    setError('');
    setResult('');
  }

  function onSubmit(event) {
    event.preventDefault();
    cleaner();

    //0x9cd29e15d5647E702696c90D64dfB31425738c06
    if (search.type === '1' && search.hash) {//wallet
      const promise = search.token === '0x12Eb9ef44dE5fbea1b2F5Ff7A9a375cAe9bFB2eb' ? getBnbBalance(search.hash) : getTokenBalance(search.hash, search.token);
      promise
        .then(balance => setResult(balance))
        .catch(err => setError(err.response ? err.response.data : err.message));
    }
    else if (search.type === '2') {
      const promise = search.token === '0x12Eb9ef44dE5fbea1b2F5Ff7A9a375cAe9bFB2eb' ? getBnbTransfers(search.hash) : getTokenTransfers(search.hash);
      promise
        .then(result => setResult(result.result))
        .catch(err => setError(err.response ? err.response.data : err.message));
    }
    else if (search.type === '3') {
      getContract(search.hash)
        .then(result => setResult(result))
        .catch(err => setError(err.response ? err.response.data : err.message));
    }
  }

  function onInputChange(event) {
    setSearch(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
  }

  return (
    <div className="wrapper">
      <header className="header">
        <div>
          <img width="160" src="https://bscscan.com/images/logo-bscscan.svg?v=0.0.3" />
        </div>
      </header>
      <main role="main">
        <section className="bg-dark">
          <div className="container">
            <h1 className="h4">BNB Smart Chain Explorer</h1>
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <select className="form-select" id="type" value={search.type} onChange={onInputChange}>
                  <option value="1">Balance</option>
                  <option value="2">Transactions</option>
                  <option value="3">Contract</option>
                </select>
                {
                  search.type === '1' || search.type === '2'
                    ? (
                      <select className="form-select" id="token" onChange={onInputChange}>
                        <option value="0x12Eb9ef44dE5fbea1b2F5Ff7A9a375cAe9bFB2eb">BNB</option>
                        <option value="0x53598858bC64f5f798B3AcB7F82FF2CB2aF463bf">BTC</option>
                        <option value="0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378">ETH</option>
                        <option value="0x64544969ed7EBf5f083679233325356EbE738930">USDC</option>
                      </select>
                    )
                    : <></>
                }
                <input type="text" id="hash" className="form-control w-50" placeholder="hash" onChange={onInputChange} />
                <button type="submit" className="btn btn-primary">Search</button>
              </div>
            </form>
          </div>
        </section>
        {
          result
            ? (
              <div className="row">
                <div className="col-12">
                  <div className="card h-100">
                    <div className="card-header">
                      <h2 className="card-header-title">Search Result</h2>
                    </div>
                    {
                      JSON.stringify(result, null, 3)
                    }
                  </div>
                </div>
              </div>
            )
            : <></>
        }
        <div className="row">
          {
            error
              ? <span class="badge bg-danger">{error}</span>
              : <></>
          }
        </div>
      </main>
    </div>
  );
}

export default App;
