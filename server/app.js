import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import apiRoutes from './routes/api.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../public')

export function createApp() {
  const app = express()

  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: true, limit: '5mb' }))

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  // API routes
  app.use('/api', apiRoutes)

  // Phục vụ hình ảnh & toàn bộ giao diện frontend gốc của ANTT Coffee
  app.use('/images', express.static(path.join(PUBLIC_DIR, 'images')))
  app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }))

  // Trang chủ mặc định
  app.get('/', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
  })

  return app
}

const app = createApp()
export default app
