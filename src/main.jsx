import React from 'react';
import ReactDOM from 'react-dom/client';
import { SimulationProvider } from './state/SimulationContext';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimulationProvider>
      <App />
    </SimulationProvider>
  </React.StrictMode>
);
