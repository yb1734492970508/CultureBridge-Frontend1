import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PremiumHomePage from './pages/PremiumHome';
import './styles/premium.css';

function App() {
  return (
    <Router>
      <div className="App">
        <PremiumHomePage />
      </div>
    </Router>
  );
}

export default App;

