import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'full-reload',
      handleHotUpdate({ server }) {
        server.ws.send({
          type: 'full-reload',
        })
      },
    },
  ],
})