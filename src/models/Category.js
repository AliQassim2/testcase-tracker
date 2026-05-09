import sql from '../config/db.js'
import crypto from 'crypto'

export async function getByProfile(profileId) {
    return sql`SELECT id, name FROM categories WHERE profile_id = ${profileId}`
}

export async function create(name, profileId) {
    const rows = await sql`
        INSERT INTO categories (id, name, profile_id)
        VALUES (${crypto.randomUUID()}, ${name}, ${profileId})
        RETURNING id
    `
    return rows[0]
}

export async function deleteOrphans(profileId, keepNames) {
    if (keepNames.length > 0) {
        await sql`
            DELETE FROM categories
            WHERE profile_id = ${profileId}
            AND name NOT IN ${sql(keepNames)}
        `
    } else {
        await sql`DELETE FROM categories WHERE profile_id = ${profileId}`
    }
}
