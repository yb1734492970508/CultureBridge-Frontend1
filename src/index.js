import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AllbirdsInspiredCultureBridge from './AllbirdsInspiredCultureBridge';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AllbirdsInspiredCultureBridge />
    </BrowserRouter>
  </React.StrictMode>
);

