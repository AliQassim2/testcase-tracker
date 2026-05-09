import { Router } from 'express'
import { findByToken } from '../models/Profile.js'
import { fetchUserData, replaceUserData } from '../models/Data.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const profile = await findByToken(req.headers.authorization)
        if (!profile) return res.status(401).json({ error: 'Invalid session.' })

        const data = await fetchUserData(profile.id)
        res.json({ username: profile.username, data })
    } catch (err) {
        console.error('Get data error:', err)
        res.status(500).json({ error: 'Failed to load data.' })
    }
})

router.put('/', async (req, res) => {
    try {
        const profile = await findByToken(req.headers.authorization)
        if (!profile) return res.status(401).json({ error: 'Invalid session.' })

        const { data } = req.body
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid data.' })
        }

        await replaceUserData(profile.id, data)
        res.json({ success: true })
    } catch (err) {
        console.error('Save data error:', err)
        res.status(500).json({ error: 'Failed to save data.' })
    }
})

export default router
