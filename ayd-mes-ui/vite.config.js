import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE: GitHub Pages gibi alt dizinde yayınlarken (örn. "/AydMES/") kullanılır.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
