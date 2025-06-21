import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CultureBridgeApp from './CultureBridgeApp';
import { I18nProvider } from './components/I18nProvider';
import './styles/culturebridge.css';

function App() {
  return (
    <I18nProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<CultureBridgeApp />} />
          </Routes>
        </div>
      </Router>
    </I18nProvider>
  );
}

export default App;

