import { Router } from 'express'
import { findByToken } from '../models/Profile.js'
import { fetchUserData, replaceUserData } from '../models/Data.js'

const router = Router()

router.get('/export', async (req, res) => {
    try {
        const profile = await findByToken(req.headers.authorization)
        if (!profile) return res.status(401).json({ error: 'Invalid session.' })

        const data = await fetchUserData(profile.id)
        const payload = { username: profile.username, exportedAt: new Date().toISOString(), data }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename="${profile.username}_tests.json"`)
        res.json(payload)
    } catch (err) {
        console.error('Export error:', err)
        res.status(500).json({ error: 'Failed to export.' })
    }
})

router.post('/import', async (req, res) => {
    try {
        const profile = await findByToken(req.headers.authorization)
        if (!profile) return res.status(401).json({ error: 'Invalid session.' })

        const { data } = req.body
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid data. Expected { data: {...} }.' })
        }

        await replaceUserData(profile.id, data)
        res.json({ success: true })
    } catch (err) {
        console.error('Import error:', err)
        res.status(500).json({ error: 'Failed to import.' })
    }
})

export default router
