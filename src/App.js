import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ModernHomePage from './pages/ModernHome';
import './styles/modern.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ModernHomePage />
      </div>
    </Router>
  );
}

export default App;

