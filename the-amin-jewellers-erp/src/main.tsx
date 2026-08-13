import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept uncaught firebase network errors to prevent app crashes
window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason;
  const msg = reason?.message || String(reason);
  if (
    msg.includes('auth/network-request-failed') || 
    msg.includes('network-request-failed') ||
    msg.includes('Could not reach Cloud Firestore backend')
  ) {
    console.warn('Network request failed handled gracefully:', msg);
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (msg.includes('auth/network-request-failed') || msg.includes('network-request-failed')) {
    console.warn('Firebase network error caught:', msg);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

