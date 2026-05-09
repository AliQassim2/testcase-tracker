import sql from '../config/db.js'
import * as Category from './Category.js'
import * as Item from './Item.js'

export async function fetchUserData(profileId) {
    const rows = await sql`
        SELECT c.name AS cat_name, i.name AS item_name, i.checked
        FROM categories c
        LEFT JOIN items i ON i.category_id = c.id
        WHERE c.profile_id = ${profileId}
        ORDER BY c.created_at, i.created_at
    `

    const result = {}
    for (const row of rows) {
        if (!result[row.cat_name]) result[row.cat_name] = {}
        if (row.item_name !== null) {
            result[row.cat_name][row.item_name] = row.checked
        }
    }
    return result
}

export async function replaceUserData(profileId, data) {
    const catRows = await Category.getByProfile(profileId)
    const catMap = {}
    for (const r of catRows) catMap[r.name] = r.id

    for (const [catName, items] of Object.entries(data)) {
        let catId = catMap[catName]

        if (!catId) {
            const inserted = await Category.create(catName, profileId)
            catId = inserted.id
            catMap[catName] = catId
        }

        for (const [itemName, checked] of Object.entries(items)) {
            await Item.upsert(itemName, checked, catId)
        }

        await Item.deleteOrphans(catId, Object.keys(items))
    }

    await Category.deleteOrphans(profileId, Object.keys(data))
}
