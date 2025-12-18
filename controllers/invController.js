const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* *******************************************
 * Build inventory by classification view
 * ******************************************* */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: `${className} vehicles`,
        nav,
        grid,
    })
}

/* *******************************************
 * Build vehicle details view
 * ******************************************* */
invCont.buildVehicleDetailsView = async function(req, res, next) {
    const inv_id = req.params.inventoryId
    const data = await invModel.getInventoryItemByInvId(inv_id)
    const details = await utilities.buildVehicleDetailsView(data)
    let nav = await utilities.getNav()
    const vehicleYear = data.inv_year
    const vehicleMake = data.inv_make
    const vehicleModel = data.inv_model
    
    // Build vehicle reviews view
    const reviewsResult = await invModel.getReviewsByInvId(inv_id)
    let account_id = null
    if (res.locals.accountData) {
        account_id = res.locals.accountData.account_id
    }
    const reviews = await utilities.buildVehicleReviewsView(reviewsResult, account_id)
    
    res.render("./inventory/details", {
        title: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
        nav,
        details,
        reviews,
        errors: null,
        inv_id
    })
}

/* *******************************************
 * Proccess add review
 * ******************************************* */
invCont.addReview = async function(req, res) {
    const inv_id = req.params.inventoryId
    let nav = await utilities.getNav()
    const { review_text, account_id }  = req.body

    const result = await invModel.addReview(review_text, inv_id, account_id)

    if (result) {
        req.flash(
            "notice",
            `The review was added.`
        )

        res.status(201).redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash(
            "notice",
            "Sorry, adding review failed."
        )
        res.status(501).render("./inventory/details", {
            title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
            nav,
            details,
            reviews,
            errors: null,
            inv_id
        })
    }
}

/* *******************************************
 * Build update review view
 * ******************************************* */
invCont.buildUpdateReviewView = async function(req, res, next) {
    let nav = await utilities.getNav()

    // Get review details by review_id
    const review_id = req.params.review_id
    const reviewResult = await invModel.getReviewByReviewId(review_id)
    const review_text = reviewResult.review_text
    const inv_id = reviewResult.inv_id

    res.render('./inventory/update-review.ejs', {
        errors: null,
        title: 'Update Review',
        nav,
        review_id,
        review_text,
        inv_id
    })
}

/* *******************************************
 * Process delete review
 * ******************************************* */
invCont.updateReview = async function(req, res, next) {
    let nav = await utilities.getNav()

    // Update review by review id
    const review_id = req.params.review_id
    const { review_text, inv_id } = req.body
    const result = invModel.updateReview(review_id, review_text)

    if (result) {
        req.flash(
            "notice",
            "The review was successfully updated."
        )

        res.status(201).redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash(
            "notice",
            "Sorry, updating review failed."
        )

        res.status(501).render('./inventory/update-review.ejs', {
            errors: null,
            title: 'Update Review',
            nav,
            review_id,
            inv_id,
            review_text
        })
    }
}

/* *******************************************
 * Build confirm delete review view
 * ******************************************* */
invCont.buildConfirmDeleteReviewView = async function(req, res, next) {
    let nav = await utilities.getNav()

    // Get review details by review_id
    const review_id = req.params.review_id
    const reviewResult = await invModel.getReviewByReviewId(review_id)
    const review_text = reviewResult.review_text
    const inv_id = reviewResult.inv_id

    res.render('./inventory/confirm-delete-review.ejs', {
        errors: null,
        title: 'Delete Review',
        nav,
        review_id,
        review_text,
        inv_id
    })
}

/* *******************************************
 * Process delete review
 * ******************************************* */
invCont.deleteReview = async function(req, res, next) {
    let nav = await utilities.getNav()

    // Delete review by review_id
    const review_id = req.params.review_id
    const { review_text, inv_id }  = req.body
    const result = await invModel.deleteReviewByReviewId(review_id)

    if (result) {
        req.flash(
            "notice",
            `The review was successfully deleted.`
        )
        res.status(201).redirect(`/inv/detail/${inv_id}`)
    } else {
        req.flash(
            "notice",
            "Sorry, deleting review failed."
        )

        res.status(501).render('./inventory/confirm-delete-review.ejs', {
            errors: null,
            title: 'Delete Review',
            nav,
            review_id,
            review_text,
            inv_id
        })
    }   
}

/* *******************************************
 * Build management view
 * ******************************************* */
invCont.buildManagementView = async function(req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: 'Vehicle Management',
        nav,
        classificationSelect
    })
}

/* *******************************************
 * Build add classification view
 * ******************************************* */
invCont.buildAddClassificationView = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: 'Add New Classification',
        nav,
        errors: null,
    })
}

/* *******************************************
 * Build add inventory view
 * ******************************************* */
invCont.buildAddInventoryView = async function(req, res, next) {
    let nav = await utilities.getNav()
    let classificationDropDown = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: 'Add New Vehicle',
        nav,
        classificationDropDown,
        errors: null,
    })
}

/* *******************************************
 * Proccess add new classification
 * ******************************************* */
invCont.addNewClassification = async function(req, res) {
    const { classification_name }  = req.body

    const result = await invModel.insertClassificationItem(classification_name)

    if (result) {
        let nav = await utilities.getNav()
        req.flash(
            "notice",
            `The ${classification_name} classification was successfully added.`
        )
        const classificationSelect = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect
        })
    } else {
        let nav = await utilities.getNav()
        req.flash(
            "notice",
            "Sorry, adding new classification failed."
        )
        res.status(501).render("./inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        })
    }
}

/* *******************************************
 * Proccess add new inventory
 * ******************************************* */
invCont.addNewInventory = async function(req, res) {
    let nav = await utilities.getNav()
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color }  = req.body

    const result = await invModel.insertInventoryItem(
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

    if (result) {
        req.flash(
            "notice",
            `The ${inv_make} ${inv_model} was successfully added.`
        )
        const classificationSelect = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect
        })
    } else {
        req.flash(
            "notice",
            "Sorry, adding new vehicle failed."
        )
        let classificationDropDown = await utilities.buildClassificationList(classification_id)
        res.status(501).render("./inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationDropDown,
            nav,
            errors: null,
        })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build modify inventory view
 * ************************** */
invCont.modifyInventoryView = async (req, res, next) => {
    const inv_id = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryItemByInvId(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    let classificationDropDown = await utilities.buildClassificationList(itemData.classification_id)

    res.render("./inventory/edit-inventory", {
        title: `Edit ${itemName}`,
        nav,
        classificationDropDown,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    })
}

/* *******************************************
 * Proccess modify inventory
 * ******************************************* */
invCont.updateInventory = async function(req, res) {
    let nav = await utilities.getNav()
    const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color }  = req.body

    const result = await invModel.updateInventory(
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
        inv_color
    )

    if (result) {
        req.flash(
            "notice",
            `The ${inv_make} ${inv_model} was successfully updated.`
        )
        const classificationSelect = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect
        })
    } else {
        req.flash(
            "notice",
            "Sorry, updating vehicle failed."
        )
        let classificationDropDown = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        res.status(501).render("./inventory/edit-inventory", {
            title: `Edit ${itemName}`,
            classificationDropDown,
            nav,
            errors: null,
            inv_id,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
    }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async (req, res, next) => {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryItemByInvId(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
        title: `Delete ${itemName}`,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_price: itemData.inv_price,
        inv_year: itemData.inv_year
    })
}

/* *******************************************
 * Proccess delete inventory
 * ******************************************* */
invCont.deleteInventory = async function(req, res) {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model }  = req.body

    // Delete all reviews before deleting inventory because of foreign key contraints
    await invModel.deleteAllReviewsByInvId(inv_id)

    const result = await invModel.deleteInventory(inv_id)

    if (result) {
        req.flash(
            "notice",
            `The ${inv_make} ${inv_model} was successfully deleted.`
        )
        const classificationSelect = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect
        })
    } else {
        req.flash(
            "notice",
            "Sorry, deleting vehicle failed."
        )
        const itemName = `${inv_make} ${inv_model}`
        res.status(501).render("./inventory/delete-inventory", {
            title: `Delete ${itemName}`,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_price,
            inv_year
        })
    }
}

module.exports = invCont