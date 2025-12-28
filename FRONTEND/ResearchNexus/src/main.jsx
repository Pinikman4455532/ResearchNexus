// src/main.jsx - Main Entry Point

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ import BrowserRouter
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ wrap App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
