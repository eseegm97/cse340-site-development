const pool = require("../database/")

/* *****************************
 * Get all classification data
 * ***************************** */
async function getClassifications() {
    return await pool.query(
            `SELECT *
            FROM public.classification
            ORDER BY classification_name`
        )
}

/* ******************************
 * Get all inventory items and classification_name by classification_id
 * ****************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT *
            FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error(`getClassificationById error ${error}`)
    }
}

/* ******************************
 * Get an inventory item by inv_id
 * ****************************** */
async function getInventoryItemByInvId(inventoryId) {
    try {
        const data = await pool.query(
            `SELECT *
            FROM public.inventory
            WHERE inv_id = $1`,
            [inventoryId]
        )
        return data.rows[0]
    } catch (error) {
        console.error(`getInventoryItemByInvId error ${error}`)
    }
}

/* ******************************
 * Insert a new classification item
 * ****************************** */
async function insertClassificationItem(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        return error.message
    }
}

/* ******************************
 * Insert a new inventory item
 * ****************************** */
async function insertInventoryItem(
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    ) {
    try {
        const sql = `
            INSERT INTO inventory 
            (
                classification_id,
                inv_make,
                inv_model,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_year,
                inv_miles,
                inv_color
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `
        return await pool.query(sql, [
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        ])
    } catch (error) {
        return error.message
    }
}

/* ******************************
 * Update inventory item
 * ****************************** */
async function updateInventory(
        inv_id,
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
    ) {
    try {
        const sql = `
            UPDATE inventory SET 
                classification_id = $1,
                inv_make = $2,
                inv_model = $3,
                inv_description = $4,
                inv_image = $5,
                inv_thumbnail = $6,
                inv_price = $7,
                inv_year = $8,
                inv_miles = $9,
                inv_color = $10
            WHERE inv_id = $11
            RETURNING *
        `
        const data = await pool.query(sql, [
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id
        ])
        return data.rows[0]
    } catch (error) {
        return error.message
    }
}

/* ******************************
 * Delete inventory item
 * ****************************** */
async function deleteInventory(inv_id) {
    try {
        const sql = 'DELETE FROM inventory WHERE inv_id = $1'
        const data = await pool.query(sql, [inv_id])
        return data
    } catch (error) {
        return error.message
    }
}

/* ******************************
 * Get all reviews by inv_id
 * ****************************** */
async function getReviewsByInvId(inventoryId) {
    try {
        const sql = `
            SELECT review_id, review_text, review_date, a.account_id, account_firstname, account_lastname
            FROM public.review r
            JOIN public.account a
                ON r.account_id = a.account_id
            WHERE inv_id = $1
            ORDER BY review_id ASC 
        `
        const data = await pool.query(sql, [inventoryId])
        return data.rows
    } catch (error) {
        console.error(`getReviewsByInvId error ${error}`)
    }
}

/* ******************************
 * Add review
 * ****************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const data = await pool.query(
            `
                INSERT INTO public.review (
                    review_text,
                    inv_id,
                    account_id
                )
                VALUES ($1, $2, $3)
            `,
            [review_text, inv_id, account_id]
        )
        return data
    } catch (error) {
        console.error(`addReview error ${error}`)
    }
}

/* ******************************
 * Get Review details by review_id
 * ****************************** */
async function getReviewByReviewId(review_id) {
    try {
        const sql = `
            SELECT *
            FROM public.review
            WHERE review_id = $1
        `
        const data = await pool.query(sql, [review_id])
        return data.rows[0]
    } catch (error) {
        console.error(`getReviewByReviewId error: ${error}`)
    }
}

/* ******************************
 * Update review_text by review_id
 * ****************************** */
async function updateReview(review_id, review_text) {
    try {
        const sql = `
            UPDATE public.review
            SET review_text = $1
            WHERE review_id = $2
        `
        return await pool.query(sql, [review_text, review_id])
    } catch (error) {
        console.error(`updateReview error: ${error}`)
    }
}

/* ******************************
 * Delete review by review_id
 * ****************************** */
async function deleteReviewByReviewId(review_id) {
    try {
        const sql = `
            DELETE FROM public.review
            WHERE review_id = $1
        `
        return await pool.query(sql, [review_id])
    } catch (error) {
        console.error(`deleteReviewByReviewId error: ${error}`)
    }
}

/* ******************************
 * Delete all reviews by inv_id
 * ****************************** */
async function deleteAllReviewsByInvId(inv_id) {
    try {
        const data = await pool.query(
            `
                DELETE FROM public.review
                WHERE inv_id = $1
            `,
            [inv_id]
        )
        return data
    } catch (error) {
        console.error(`deleteAllReviewByInvId error: ${error}`)
    }
}

/* ******************************
 * Get all reviews by account_id
 * ****************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `
            SELECT r.review_id, r.review_text, r.review_date, r.inv_id,
                   i.inv_year, i.inv_make, i.inv_model
            FROM public.review r
            JOIN public.inventory i ON r.inv_id = i.inv_id
            WHERE r.account_id = $1
            ORDER BY r.review_date DESC
        `
        const data = await pool.query(sql, [account_id])
        return data.rows
    } catch (error) {
        console.error(`getReviewsByAccountId error: ${error}`)
        return []
    }
}

module.exports = { 
    getClassifications,
    getInventoryByClassificationId,
    getInventoryItemByInvId,
    insertClassificationItem,
    insertInventoryItem,
    updateInventory,
    deleteInventory,
    getReviewsByInvId,
    addReview,
    getReviewByReviewId,
    updateReview,
    deleteReviewByReviewId,
    deleteAllReviewsByInvId,
    getReviewsByAccountId
}