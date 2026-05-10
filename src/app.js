import 'dotenv/config'
import express from 'express'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import dataRoutes from './routes/data.js'
import exportRoutes from './routes/export.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicPath = resolve(__dirname, '..', 'public')

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.static(publicPath))

app.use('/api/auth', authRoutes)
app.use('/api/data', dataRoutes)
app.use('/api', exportRoutes)

app.get('*', (req, res) => {
    res.sendFile(resolve(publicPath, 'index.html'))
})

export default app
