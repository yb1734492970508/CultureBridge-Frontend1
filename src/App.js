import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthContext';
import { RewardProvider } from './context/reward/RewardContext';
import { ThemeProvider } from './context/theme/ThemeContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import Chat from './pages/Chat';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RewardProvider>
          <div className="App">
            <Header />
            <Navigation />
            
            <main className="App-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/community" element={<Community />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </RewardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

