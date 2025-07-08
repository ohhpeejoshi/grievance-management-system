import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
        react()
    ],

    server: {
        // the port your Vite dev server will listen on
        port: 5174,

        // ensure the HMR websocket also lives there
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 5174,
        },

        // proxy any /api/* requests to your Express backend
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
