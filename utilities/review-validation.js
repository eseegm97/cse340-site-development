const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
    return [
        // Review text is required and must be at least 10 characters
        body("review_text")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 10 })
            .withMessage("Review must be at least 10 characters long.")
            .isLength({ max: 1000 })
            .withMessage("Review cannot exceed 1000 characters."),
        
        // Inventory ID must be present and be a positive integer
        body("inv_id")
            .isInt({ min: 1 })
            .withMessage("Valid inventory ID is required."),
            
        // Account ID must be present and be a positive integer
        body("account_id")
            .isInt({ min: 1 })
            .withMessage("Valid account ID is required.")
    ]
}

/* ******************************
 * Check data and return errors or continue to add review
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
    const { review_text, inv_id, account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/detail", {
            errors,
            title: "Add Review",
            nav,
            review_text,
            inv_id,
            account_id
        })
        return
    }
    next()
}

/*  **********************************
 *  Review Update Data Validation Rules
 * ********************************* */
validate.reviewUpdateRules = () => {
    return [
        // Review text is required and must be at least 10 characters
        body("review_text")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 10 })
            .withMessage("Review must be at least 10 characters long.")
            .isLength({ max: 1000 })
            .withMessage("Review cannot exceed 1000 characters."),
            
        // Review ID must be present and be a positive integer
        body("review_id")
            .isInt({ min: 1 })
            .withMessage("Valid review ID is required.")
    ]
}

/* ******************************
 * Check review update data and return errors or continue
 * ***************************** */
validate.checkReviewUpdateData = async (req, res, next) => {
    const { review_text, review_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("review/edit-review", {
            errors,
            title: "Edit Review",
            nav,
            review_text,
            review_id
        })
        return
    }
    next()
}

module.exports = validate