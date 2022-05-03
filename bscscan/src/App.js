import { useState } from 'react';
import './App.css';
import TokenSelect from './components/TokenSelect';
import SearchSelect from './components/SearchSelect';
import TransferSelect from './components/TransferSelect';
import BalanceCard from './components/BalanceCard';
import TransactionCard from './components/TransactionCard';
import ContractCard from './components/ContractCard';
import { getTokenBalance, getBnbBalance, getContract, getTokenTransfers, getBnbTransfers } from './services/BscScanService';

function App() {

  const BNB = '0x12Eb9ef44dE5fbea1b2F5Ff7A9a375cAe9bFB2eb';

  const [search, setSearch] = useState({
    type: '1',
    token: BNB,
    address: ''
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
  if (search.type === '1' && search.address) {//wallet
    const promise = search.token === BNB ? getBnbBalance(search.address) : getTokenBalance(search.address, search.token);
    promise
      .then(balance => setResult(balance))
      .catch(err => setError(err.response ? err.response.data : err.message));
  }
  else if (search.type === '2') {
    const promise = search.token === BNB ? getBnbTransfers(search.address) : getTokenTransfers(search.address);
    promise
      .then(result => setResult(result.result))
      .catch(err => setError(err.response ? err.response.data : err.message));
  }
  else if (search.type === '3') {
    getContract(search.address)
      .then(result => setResult(result))
      .catch(err => setError(err.response ? err.response.data : err.message));
  }
}

  function onInputChange(event) {
    if(event.target.id === 'type') setResult(null);
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
          <div className="search">
            <h1 className="title">BNB Smart Chain Explorer</h1>
            <form onSubmit={onSubmit}>
              <div className="input-group">
                <SearchSelect onChange={onInputChange} />
                {
                  search.type === '1'
                    ? <TokenSelect default={BNB} onChange={onInputChange} />
                    : <></>
                }
                {
                  search.type === '2'
                    ? <TransferSelect default={BNB} onChange={onInputChange} />
                    : <></>
                }
                <input type="text" id="address" className="form-control w-50" placeholder="address" onChange={onInputChange} />
                <button type="submit" className="btn btn-primary submit">
                  <svg className="icon icon-xs" x-description="Heroicon name: solid/search"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd">
                    </path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>
        {
          result && search.type === '1'
            ? <BalanceCard data={result} />
            : <></>
        }
        {
          result && search.type === '2'
            ? result.map(tx => (<TransactionCard key={tx.timestamp} data={tx} />))
            : <></>
        }
        {
          result && search.type === '3'
            ? <ContractCard data={result} />
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
