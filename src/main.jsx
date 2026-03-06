import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import QRScannerMock from './pages/QRScannerMock.jsx';
import MapPage from './pages/MapPage.jsx';
import Gamificare from './pages/Gamificare.jsx';
import './styles/global.css'; // Primary global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="scanner" element={<QRScannerMock />} />
          <Route path="map" element={<MapPage />} />
          <Route path="gamificare" element={<Gamificare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
