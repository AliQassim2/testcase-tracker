import sql from '../config/db.js'
import crypto from 'crypto'

export async function upsert(name, checked, categoryId) {
    await sql`
        INSERT INTO items (id, name, checked, category_id)
        VALUES (${crypto.randomUUID()}, ${name}, ${checked}, ${categoryId})
        ON CONFLICT (category_id, name) DO UPDATE SET checked = ${checked}
    `
}

export async function deleteOrphans(categoryId, keepNames) {
    if (keepNames.length > 0) {
        await sql`
            DELETE FROM items
            WHERE category_id = ${categoryId}
            AND name NOT IN ${sql(keepNames)}
        `
    } else {
        await sql`DELETE FROM items WHERE category_id = ${categoryId}`
    }
}

export async function seedByCategory(items, categoryId) {
    for (const [itemName, checked] of Object.entries(items)) {
        await sql`
            INSERT INTO items (id, name, checked, category_id)
            VALUES (${crypto.randomUUID()}, ${itemName}, ${checked}, ${categoryId})
        `
    }
}
