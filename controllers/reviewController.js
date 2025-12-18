const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

const reviewCont = {}

/* *******************************************
 * Add new review
 * ******************************************* */
reviewCont.addReview = async function (req, res, next) {
    let { review_text, inv_id, account_id } = req.body
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const data = await invModel.getInventoryItemByInvId(inv_id)
        const details = await utilities.buildVehicleDetailsView(data)
        
        // Build vehicle reviews view
        const reviewsResult = await invModel.getReviewsByInvId(inv_id)
        const reviews = await utilities.buildVehicleReviewsView(reviewsResult, account_id)
        
        res.status(400).render("./inventory/detail", {
            errors: errors.array(),
            title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
            nav,
            details,
            reviews,
            inv_id,
            review_text
        })
        return
    }
    
    const reviewResult = await invModel.addReview(review_text, inv_id, account_id)
    
    if (reviewResult) {
        req.flash("notice", "Review successfully added.")
        res.status(201).redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash("notice", "Sorry, adding the review failed.")
        res.status(501).redirect(`/inv/detail/${inv_id}`)
    }
}

/* *******************************************
 * Build edit review view
 * ******************************************* */
reviewCont.buildEditReview = async function (req, res, next) {
    const review_id = parseInt(req.params.reviewId)
    let nav = await utilities.getNav()
    const reviewData = await invModel.getReviewByReviewId(review_id)
    
    // Check if review exists and belongs to logged-in user
    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don't have permission to edit it.")
        res.redirect("/account/")
        return
    }
    
    res.render("./review/edit-review", {
        title: "Edit Review",
        nav,
        errors: null,
        review_id: reviewData.review_id,
        review_text: reviewData.review_text,
        inv_id: reviewData.inv_id
    })
}

/* *******************************************
 * Process review update
 * ******************************************* */
reviewCont.updateReview = async function (req, res, next) {
    let { review_text, review_id, inv_id } = req.body
    review_id = parseInt(review_id)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.status(400).render("./review/edit-review", {
            title: "Edit Review",
            nav,
            errors: errors.array(),
            review_id,
            review_text,
            inv_id
        })
        return
    }
    
    // Verify ownership before updating
    const reviewData = await invModel.getReviewByReviewId(review_id)
    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don't have permission to edit it.")
        res.redirect("/account/")
        return
    }
    
    const updateResult = await invModel.updateReview(review_id, review_text)
    
    if (updateResult) {
        req.flash("notice", "Review successfully updated.")
    } else {
        req.flash("notice", "Sorry, updating the review failed.")
    }
    res.redirect("/account/")
}

/* *******************************************
 * Build delete review view
 * ******************************************* */
reviewCont.buildDeleteReview = async function (req, res, next) {
    const review_id = parseInt(req.params.reviewId)
    let nav = await utilities.getNav()
    const reviewData = await invModel.getReviewByReviewId(review_id)
    
    // Check if review exists and belongs to logged-in user
    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don't have permission to delete it.")
        res.redirect("/account/")
        return
    }
    
    // Get inventory data for context
    const invData = await invModel.getInventoryItemByInvId(reviewData.inv_id)
    
    res.render("./review/delete-review", {
        title: "Delete Review",
        nav,
        errors: null,
        review_id: reviewData.review_id,
        review_text: reviewData.review_text,
        inv_id: reviewData.inv_id,
        vehicle_info: `${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`
    })
}

/* *******************************************
 * Process review deletion
 * ******************************************* */
reviewCont.deleteReview = async function (req, res, next) {
    let { review_id } = req.body
    review_id = parseInt(review_id)
    
    // Verify ownership before deleting
    const reviewData = await invModel.getReviewByReviewId(review_id)
    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Review not found or you don't have permission to delete it.")
        res.redirect("/account/")
        return
    }
    
    const deleteResult = await invModel.deleteReviewByReviewId(review_id)
    
    if (deleteResult) {
        req.flash("notice", "Review successfully deleted.")
    } else {
        req.flash("notice", "Sorry, deleting the review failed.")
    }
    res.redirect("/account/")
}

module.exports = reviewCont