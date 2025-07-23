import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './api/axiosConfig'; // Import to set up the interceptor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);