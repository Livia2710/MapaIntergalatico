import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // O import correto é do pacote do vite

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Certifique-on de que está chamando o plugin do vite aqui
  ],
})
