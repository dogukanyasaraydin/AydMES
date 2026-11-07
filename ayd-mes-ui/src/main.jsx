import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DEMO_MODE } from './config/api'

// Hızlı Demo / Offline Mod için Akıllı Fetch Interceptor
// Normalde 8 saniye (8000ms) bekler (yavaş PC'ler için).
// Backend'in kapalı olduğunu anlarsa sonraki isteklerde 5 saniyede pes eder.
// Böylece sistemin donmasını engeller ama yavaş bilgisayarlarda da veriyi kesmez.
// DEMO_MODE'da API isteği hiç gönderilmez; sayfalar doğrudan mock verilere düşer.
const originalFetch = window.fetch;
window._isBackendDead = false;

window.fetch = async (...args) => {
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

  if (DEMO_MODE && url && url.includes('/api/')) {
    window._isBackendDead = true;
    window.dispatchEvent(new CustomEvent('backend-status', { detail: false }));
    throw new TypeError('Demo modu: backend devre dışı');
  }
  
  if (url && (url.includes('127.0.0.1') || url.includes('localhost'))) {
    const controller = new AbortController();
    // Eğer backend kapalıysa süreyi çok kısa tut (300ms), açıksa yavaş PC'lere tolerans tanı (8000ms)
    const timeoutDuration = window._isBackendDead ? 5000 : 8000; 
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    try {
      const options = args[1] || {};
      const res = await originalFetch(args[0], { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      
      // Başarılı olursa backend'i tekrar "Canlı" işaretle
      if (window._isBackendDead) {
        window._isBackendDead = false;
      }
      window.dispatchEvent(new CustomEvent('backend-status', { detail: true }));
      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      window._isBackendDead = true; // Backend düştü!
      window.dispatchEvent(new CustomEvent('backend-status', { detail: false }));
      throw error;
    }
  }
  return originalFetch(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
