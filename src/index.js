import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ModernCultureBridge from './ModernCultureBridge';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ModernCultureBridge />
    </BrowserRouter>
  </React.StrictMode>
);

