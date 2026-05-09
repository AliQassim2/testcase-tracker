import sql from '../config/db.js'
import crypto from 'crypto'

export async function findByToken(token) {
    if (!token) return null
    const rows = await sql`SELECT id, username FROM profiles WHERE token = ${token}`
    return rows[0] || null
}

export async function findByUsername(username) {
    const rows = await sql`SELECT id, username, token FROM profiles WHERE username = ${username}`
    return rows[0] || null
}

export async function create(username, token) {
    const rows = await sql`
        INSERT INTO profiles (id, username, token)
        VALUES (${crypto.randomUUID()}, ${username}, ${token})
        RETURNING id, username, token
    `
    return rows[0]
}
