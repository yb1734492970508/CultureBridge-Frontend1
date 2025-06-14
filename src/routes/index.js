import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import CulturalExchangeList from '../pages/CulturalExchange/CulturalExchangeList';
import CulturalExchangeDetail from '../pages/CulturalExchange/CulturalExchangeDetail';
import LanguageLearningList from '../pages/LanguageLearning/LanguageLearningList';
import LanguageLearningDetail from '../pages/LanguageLearning/LanguageLearningDetail';
import Wallet from '../pages/Blockchain/Wallet';
import Token from '../pages/Blockchain/Token';
import ChatRoom from '../pages/Chat/ChatRoom';
import Profile from '../pages/Profile/Profile';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Cultural Exchange Routes */}
          <Route path="cultural-exchanges" element={<CulturalExchangeList />} />
          <Route path="cultural-exchanges/:id" element={<CulturalExchangeDetail />} />

          {/* Language Learning Routes */}
          <Route path="language-learning" element={<LanguageLearningList />} />
          <Route path="language-learning/:id" element={<LanguageLearningDetail />} />

          {/* Blockchain Routes */}
          <Route path="wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="token" element={<PrivateRoute><Token /></PrivateRoute>} />

          {/* Chat Routes */}
          <Route path="chat/:roomId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />

          {/* Profile Routes */}
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Catch all - 404 Not Found */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;

