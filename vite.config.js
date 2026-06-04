import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://evade-api.watchouttech.xyz',
        changeOrigin: true,
      },
      '/call-agent': {
        target: 'https://2aofmyjqqz47wsdd6wwzywxnam0qokpc.lambda-url.eu-west-2.on.aws',
        changeOrigin: true,
        rewrite: () => '/',
      },
    },
  },
  test: {
    include: ['./src/tests/**/*.test.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
})
