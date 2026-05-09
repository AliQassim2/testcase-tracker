import { Router } from 'express'
import * as Profile from '../models/Profile.js'
import { create as createCategory } from '../models/Category.js'
import { seedByCategory as seedItems } from '../models/Item.js'
import { SEED, generateToken } from '../models/seed.js'

const router = Router()

router.post('/register', async (req, res) => {
    try {
        const { username } = req.body
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Username is required.' })
        }
        const u = username.trim().toLowerCase()

        const existing = await Profile.findByUsername(u)
        if (existing) {
            return res.status(409).json({ error: 'Username already taken.' })
        }

        const token = generateToken()
        const profile = await Profile.create(u, token)

        for (const [catName, items] of Object.entries(SEED)) {
            const cat = await createCategory(catName, profile.id)
            await seedItems(items, cat.id)
        }

        res.json({ username: profile.username, token: profile.token })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'Failed to create account.' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username } = req.body
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Username is required.' })
        }
        const u = username.trim().toLowerCase()

        const profile = await Profile.findByUsername(u)
        if (!profile) {
            return res.status(404).json({ error: 'Username not found.' })
        }

        res.json({ username: profile.username, token: profile.token })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Something went wrong.' })
    }
})

export default router
