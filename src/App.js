import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, AuthGuard } from './contexts/AuthContext';
import { TokenProvider } from './context/token/TokenContext';
import { BlockchainProvider } from './context/blockchain/BlockchainContext';
import { ErrorBoundary } from './utils/errorHandler';
import socketService from './services/socketService';

// Import existing components and pages
import BNBWalletConnector from './components/blockchain/BNBWalletConnector';
import CBTTokenManager from './components/token/CBTTokenManager';
import EnhancedCBTManager from './components/token/EnhancedCBTManager';
import EnhancedWalletConnector from './components/blockchain/EnhancedWalletConnector';
import NFTMinter from './components/blockchain/NFTMinter';
import NFTGallery from './components/blockchain/NFTGallery';
import NFTDetail from './components/blockchain/NFTDetail';
import CopyrightProtection from './components/blockchain/CopyrightProtection';
import BridgeInterface from './components/cross-chain/BridgeInterface';
import TokenEconomyDashboard from './components/token/TokenEconomyDashboard';
import MultiChainAssetManager from './components/asset/MultiChainAssetManager';
import MultiChainWallet from './components/blockchain/MultiChainWallet';
import SwapInterface from './components/defi/dex/SwapInterface';
import FarmList from './components/defi/farming/FarmList';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import SecuritySettings from './pages/auth/SecuritySettings';

// New components for enhanced UI
import ChatRoomList from './components/chat/ChatRoomList';
import ChatWindow from './components/chat/ChatWindow';
import VoiceTranslator from './components/voice/VoiceTranslator';
import CulturalFeed from './components/cultural/CulturalFeed';
import DiscoverPage from './components/discover/DiscoverPage';
import LearningDashboard from './components/learning/LearningDashboard';

// New UI components
import BottomNavigation from './components/ui/BottomNavigation';
import TopHeader from './components/ui/TopHeader';
import SplashScreen from './components/ui/SplashScreen';

import './App.css';
import './styles/modern-ui.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Initialize socket service when the app mounts
    socketService.connect();
    socketService.startHeartbeat();

    // Simulate app loading
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2000);

    // Clean up socket service when the app unmounts
    return () => {
      socketService.stopHeartbeat();
      socketService.disconnect();
    };
  }, []);

  if (showSplash) {
    return <SplashScreen isLoading={isLoading} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <TokenProvider>
          <BlockchainProvider>
            <div className="App modern-app">
              <TopHeader />
              
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<CulturalFeed />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route path="/chat" element={<AuthGuard><ChatRoomList /></AuthGuard>} />
                  <Route path="/chat/:roomId" element={<AuthGuard><ChatWindow /></AuthGuard>} />
                  <Route path="/learn" element={<AuthGuard><LearningDashboard /></AuthGuard>} />
                  <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                  <Route path="/translate" element={<AuthGuard><VoiceTranslator /></AuthGuard>} />
                  
                  {/* Legacy routes */}
                  <Route path="/wallet" element={<AuthGuard><MultiChainWallet /></AuthGuard>} />
                  <Route path="/mint" element={<AuthGuard><NFTMinter /></AuthGuard>} />
                  <Route path="/gallery" element={<NFTGallery />} />
                  <Route path="/nft/:tokenId" element={<NFTDetailWrapper />} />
                  <Route path="/copyright" element={<AuthGuard><CopyrightProtection /></AuthGuard>} />
                  <Route path="/bridge" element={<AuthGuard><BridgeInterface /></AuthGuard>} />
                  <Route path="/assets" element={<AuthGuard><MultiChainAssetManager /></AuthGuard>} />
                  <Route path="/token-economy" element={<TokenEconomyDashboard />} />
                  <Route path="/cbt-manager" element={<AuthGuard><EnhancedCBTManager /></AuthGuard>} />
                  <Route path="/wallet-connector" element={<AuthGuard><EnhancedWalletConnector /></AuthGuard>} />
                  <Route path="/swap" element={<AuthGuard><SwapInterface /></AuthGuard>} />
                  <Route path="/farming" element={<AuthGuard><FarmList /></AuthGuard>} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/security" element={<AuthGuard><SecuritySettings /></AuthGuard>} />
                </Routes>
              </main>
              
              <BottomNavigation />
            </div>
          </BlockchainProvider>
        </TokenProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// NFT详情包装组件，用于获取路由参数
function NFTDetailWrapper() {
  const tokenId = window.location.pathname.split('/').pop();
  return <NFTDetail tokenId={tokenId} />;
}

export default App;


