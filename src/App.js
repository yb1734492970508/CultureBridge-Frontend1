import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CultureBridgeApp from './CultureBridgeApp';
import './styles/culturebridge.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CultureBridgeApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

