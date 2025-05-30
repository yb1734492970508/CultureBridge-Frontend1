import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import IdentityRegistration from './components/identity/IdentityRegistration';
import NFTMarketplace from './components/nft/NFTMarketplace';
import EventsPage from './components/events/EventsPage';
import PointsPage from './components/points/PointsPage';
import ProfilePage from './components/profile/ProfilePage';

function App() {
  return (
    <Web3Provider>
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Header />
        <Container maxW="container.xl" flex="1" py={8}>
          <Routes>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/identity" element={<IdentityRegistration />} />
            <Route path="/nft-marketplace" element={<NFTMarketplace />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Container>
        <Footer />
      </Box>
    </Web3Provider>
  );
}

export default App;
