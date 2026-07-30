import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to prevent app crashes from transient network & WebChannel/WebSocket hiccups
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('WebChannel') ||
    reasonStr.includes('unavailable') ||
    reasonStr.includes('Cloud Firestore backend') ||
    reasonStr.includes('Listen') ||
    reasonStr.includes('transport')
  ) {
    event.preventDefault();
    console.warn('Ignored transient network stream rejection:', reasonStr);
  }
});

window.addEventListener('error', (event) => {
  const errorMsg = String(event.message || '');
  if (
    errorMsg.includes('WebSocket') ||
    errorMsg.includes('WebChannel') ||
    errorMsg.includes('unavailable') ||
    errorMsg.includes('Listen')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
