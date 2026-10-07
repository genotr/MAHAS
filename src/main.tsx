import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard to ignore third-party browser extension errors (like MetaMask, Phantom, etc.) 
// that can bubble up inside the sandboxed preview iframe of AI Studio.
if (typeof window !== 'undefined') {
  const isExtensionOrWalletError = (msg: string): boolean => {
    const lower = msg.toLowerCase();
    return (
      lower.includes('metamask') ||
      lower.includes('ethereum') ||
      lower.includes('wallet') ||
      lower.includes('extension') ||
      lower.includes('web3') ||
      lower.includes('rpc') ||
      lower.includes('provider')
    );
  };

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (isExtensionOrWalletError(message)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (isExtensionOrWalletError(reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

