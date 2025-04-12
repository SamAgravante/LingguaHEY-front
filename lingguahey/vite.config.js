import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< Updated upstream
=======
  base: process.env.VITE_BASE_PATH || "/"
  //base: import.meta.env.VITE_BASE_PATH || "/"
  //base: process.env.VITE_BASE_PATH || "/LingguaHEY-front"
>>>>>>> Stashed changes
})
