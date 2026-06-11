import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' rende la build utilizzabile da qualsiasi sottocartella
// (GitHub Pages, Netlify, apertura diretta del file, ecc.)
export default defineConfig({
  plugins: [react()],
  base: './',
})
