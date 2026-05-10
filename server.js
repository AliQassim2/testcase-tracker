import 'dotenv/config'
import express from 'express'
import authRoutes from './src/routes/auth.js'
import dataRoutes from './src/routes/data.js'
import exportRoutes from './src/routes/export.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '10mb' }))
app.use(express.static('public'))

app.use('/api/auth', authRoutes)
app.use('/api/data', dataRoutes)
app.use('/api', exportRoutes)

export default app

if (process.argv[1] && !process.argv[1].includes('.vercel')) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}
