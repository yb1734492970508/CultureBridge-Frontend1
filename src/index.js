import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { BlockchainProvider } from './context/blockchain';
import { TokenProvider } from './context/token/TokenContext';
import App from './App';
import './index.css';
import './styles/blockchain.css';
import './styles/token-economy.css';

// 获取Web3提供者
function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <BlockchainProvider>
        <TokenProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </Router>
        </TokenProvider>
      </BlockchainProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);
