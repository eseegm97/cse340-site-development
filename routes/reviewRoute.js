// Needed Resources
const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
const reviewValidate = require('../utilities/review-validation')

// Route to add new review
router.post("/add-review", 
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
)

// Route to build edit review view
router.get("/edit/:reviewId", 
    utilities.checkLogin,
    utilities.handleErrors(reviewController.buildEditReview)
)

// Route to process review update
router.post("/update", 
    utilities.checkLogin,
    reviewValidate.reviewUpdateRules(),
    reviewValidate.checkReviewUpdateData,
    utilities.handleErrors(reviewController.updateReview)
)

// Route to build delete review view
router.get("/delete/:reviewId", 
    utilities.checkLogin,
    utilities.handleErrors(reviewController.buildDeleteReview)
)

// Route to process review deletion
router.post("/delete", 
    utilities.checkLogin,
    utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router