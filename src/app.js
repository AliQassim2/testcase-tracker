import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.js'
import dataRoutes from './routes/data.js'
import exportRoutes from './routes/export.js'

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.static('public'))

app.use('/api/auth', authRoutes)
app.use('/api/data', dataRoutes)
app.use('/api', exportRoutes)

export default app
