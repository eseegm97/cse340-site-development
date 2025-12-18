const pool = require("../database/")

/* *****************************
 * Get all reviews by inventory ID
 * ***************************** */
async function getReviewsByInvId(inv_id) {
    try {
        const data = await pool.query(
            `SELECT r.review_id, r.review_text, r.review_date, 
                    a.account_firstname, a.account_lastname, a.account_id
            FROM public.review r
            JOIN public.account a ON r.account_id = a.account_id
            WHERE r.inv_id = $1
            ORDER BY r.review_date DESC`,
            [inv_id]
        )
        return data.rows
    } catch (error) {
        console.error(`getReviewsByInvId error ${error}`)
        return []
    }
}

/* *****************************
 * Get all reviews by account ID
 * ***************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const data = await pool.query(
            `SELECT r.review_id, r.review_text, r.review_date, r.inv_id,
                    i.inv_year, i.inv_make, i.inv_model
            FROM public.review r
            JOIN public.inventory i ON r.inv_id = i.inv_id
            WHERE r.account_id = $1
            ORDER BY r.review_date DESC`,
            [account_id]
        )
        return data.rows
    } catch (error) {
        console.error(`getReviewsByAccountId error ${error}`)
        return []
    }
}

/* *****************************
 * Get single review by review ID
 * ***************************** */
async function getReviewById(review_id) {
    try {
        const data = await pool.query(
            `SELECT r.review_id, r.review_text, r.review_date, r.inv_id, r.account_id,
                    a.account_firstname, a.account_lastname,
                    i.inv_year, i.inv_make, i.inv_model
            FROM public.review r
            JOIN public.account a ON r.account_id = a.account_id
            JOIN public.inventory i ON r.inv_id = i.inv_id
            WHERE r.review_id = $1`,
            [review_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error(`getReviewById error ${error}`)
        return null
    }
}

/* *****************************
 * Add new review
 * ***************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const sql = `INSERT INTO public.review (review_text, inv_id, account_id) 
                    VALUES ($1, $2, $3) 
                    RETURNING review_id`
        const result = await pool.query(sql, [review_text, inv_id, account_id])
        return result.rows[0]
    } catch (error) {
        console.error(`addReview error ${error}`)
        return null
    }
}

/* *****************************
 * Update review
 * ***************************** */
async function updateReview(review_id, review_text) {
    try {
        const sql = `UPDATE public.review 
                    SET review_text = $1 
                    WHERE review_id = $2`
        const result = await pool.query(sql, [review_text, review_id])
        return result.rowCount > 0
    } catch (error) {
        console.error(`updateReview error ${error}`)
        return false
    }
}

/* *****************************
 * Delete review
 * ***************************** */
async function deleteReview(review_id) {
    try {
        const sql = `DELETE FROM public.review WHERE review_id = $1`
        const result = await pool.query(sql, [review_id])
        return result.rowCount > 0
    } catch (error) {
        console.error(`deleteReview error ${error}`)
        return false
    }
}

/* *****************************
 * Check if review belongs to account
 * ***************************** */
async function checkReviewOwnership(review_id, account_id) {
    try {
        const data = await pool.query(
            `SELECT review_id FROM public.review 
            WHERE review_id = $1 AND account_id = $2`,
            [review_id, account_id]
        )
        return data.rowCount > 0
    } catch (error) {
        console.error(`checkReviewOwnership error ${error}`)
        return false
    }
}

module.exports = {
    getReviewsByInvId,
    getReviewsByAccountId,
    getReviewById,
    addReview,
    updateReview,
    deleteReview,
    checkReviewOwnership
}