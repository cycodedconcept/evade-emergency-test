import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['./src/tests/**/*.test.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
})
