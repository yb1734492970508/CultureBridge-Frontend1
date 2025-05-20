import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { BlockchainProvider } from './context/blockchain';
import './styles/App.css';

// 获取以太坊提供者
function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BlockchainProvider>
        <div className="App">
          <header className="App-header">
            <h1>CultureBridge</h1>
            <p>跨文化交流平台 - 区块链版</p>
          </header>
          <main className="App-main">
            <p>欢迎来到CultureBridge跨文化交流平台！</p>
            <p>我们正在集成区块链技术，敬请期待更多功能。</p>
          </main>
        </div>
      </BlockchainProvider>
    </Web3ReactProvider>
  );
}

export default App;
