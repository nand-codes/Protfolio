import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function trackRoutePlugin(): Plugin {
  const rewrite = (
    req: { url?: string },
    _res: unknown,
    next: () => void,
  ) => {
    const url = req.url?.split('?')[0]
    if (url === '/track' || url === '/track/') {
      const query = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
      req.url = `/track/index.html${query}`
    }
    next()
  }

  return {
    name: 'track-route',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), trackRoutePlugin()],
})
