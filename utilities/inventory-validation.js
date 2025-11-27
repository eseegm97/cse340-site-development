const utilities = require("./index")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ***********************************
 *  New Classification Data Validation Rules
 * *********************************** */
validate.newClassificationRules = () => {
    return [
        // classification_name is required and must be only alphabetic charatcers
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isAlpha()
            .withMessage("Please provide a valid classification name."),
    ]
}

/* ***********************************
 *  Check data and return errors or continue
 * *********************************** */
validate.checkNewClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name
        })
        return
    }
    next()
}

/* ***********************************
 *  New Inventory Data Validation Rules
 * *********************************** */
validate.newInventoryRules = () => {
    return [
        // classification_id is required
        body("classification_id")
            .notEmpty()
            .withMessage("Please select a classification name."),
        
        // inv_make is required, min length of 3
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid make."),

        // inv_model is required, min length of 3
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid model."),

        // inv_description is required
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a valid description."),

        // inv_image is required
        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Please provide a valid image url."),

        // inv_thumbnail is required
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Please provide a valid thumbnail url."),

        // inv_price is required, should be a number
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide a valid price."),

        // inv_year is required, length of 4, should be a int
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .isLength({ min: 4, max: 4})
            .withMessage("Please provide a valid year."),

        // inv_miles is required, should be a int
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .withMessage("Please provide a valid miles amount."),

        // inv_color is required
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a valid color."),
    ]
}

/* ***********************************
 *  Check data and return errors or continue
 * *********************************** */
validate.checkNewInventoryData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationDropDown = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationDropDown,
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
        })
        return
    }
    next()
}

/* ***********************************
 *  Check edit data and return errors or continue
 * *********************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationDropDown = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            errors,
            title: `Edit ${inv_make} ${inv_model}`,
            nav,
            classificationDropDown,
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
        })
        return
    }
    next()
}

/* ***********************************
 *  Add Review Data Validation Rules
 * *********************************** */
validate.addReviewRules = () => {
    return [
        // review_text is required
        body("review_text")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide valid review text."),
    ]
}

/* ***********************************
 *  Check data and return errors or continue with add review
 * *********************************** */
validate.checkAddReviewData = async (req, res, next) => {
    const inv_id = req.params.inventoryId
    const { review_text } = req.body

    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        // Build nav
        let nav = await utilities.getNav()

        // Get vehicle details
        const data = await invModel.getInventoryItemByInvId(inv_id)

        // Build vehicle details view
        const details = await utilities.buildVehicleDetailsView(data)

        // Build vehicle reveiws view
        const reviewsResult = await invModel.getReviewsByInvId(inv_id)
        if (res.locals.accountData) {
            account_id = res.locals.accountData.account_id
        }
        const reviews = await utilities.buildVehicleReviewsView(reviewsResult, account_id)

        // Direct user to form errors
        req.flash("notice", "See errors below from adding new review")

        res.render("./inventory/details", {
            errors,
            title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
            nav,
            details,
            reviews,
            inv_id,
            review_text
        })
        return
    }
    next()
}

/* ***********************************
 *  Check data and return errors or continue with update review
 * *********************************** */
validate.checkUpdateReviewData = async (req, res, next) => {
    const review_id = req.params.review_id
    const { review_text, inv_id } = req.body

    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        // Build nav
        let nav = await utilities.getNav()

        res.render("./inventory/update-review.ejs", {
            errors,
            title: 'Update Review',
            nav,
            review_id,
            inv_id,
            review_text
        })
        return
    }
    next()
}

module.exports = validate