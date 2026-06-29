import { defineConfig } from 'vite'
import inertia from '@inertiajs/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    publicDir: false,
    plugins: [
        react(),
        tailwindcss(),
        inertia({
            ssr: {
                sourcemap: true
            }
        }),
    ],
    build: {
        manifest: true,
        outDir: 'public/build',
        rolldownOptions: { input: ['resources/css/app.css', 'resources/js/app.tsx'] },
    },
})