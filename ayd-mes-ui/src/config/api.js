export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5139/api';

// VITE_DEMO_MODE=true ile derlenen sürüm (örn. GitHub Pages canlı demosu) backend'e hiç istek atmaz,
// doğrudan örnek (mock) verilerle çalışır.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
