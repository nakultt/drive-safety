import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Debug helper — write simple marker to DOM to help detect if root mount runs
try {
  const el = document.getElementById('root-fallback');
  if (el) el.textContent = 'Starting application...';
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// After mount, remove fallback text (if still present)
setTimeout(() => {
  const el = document.getElementById('root-fallback');
  if (el) el.remove();
}, 1200);

