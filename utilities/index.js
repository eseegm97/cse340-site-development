const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* *****************************
 * Constructs the nav HTML unordered list
 * ***************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = `
        <ul>
            <li><a href="/" title="Home page">Home</a></li>
    `
    data.rows.forEach(row => {
        list += `
            <li>
                <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>
            </li>
        `
    })
    list += '</ul>'
    return list
}

/* ***************************************
 * Build the classification view HTML
 * *************************************** */
Util.buildClassificationGrid = async function(data) {
    let grid = ''
    if (data.length > 0) {
        grid += '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += `
                <li>
                    <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                        <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
                    </a>
                    <div class="namePrice">
                        <hr />
                        <h2>
                            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>
                        </h2>
                        <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
                    </div>
                </li>
            `
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* ***************************************
 * Build the vehicle details view HTML
 * *************************************** */
Util.buildVehicleDetailsView = async function (data) {
    const priceFormatted = Number(data.inv_price).toLocaleString('en-US')
    const milesFormatted = data.inv_miles.toLocaleString('en-US')

    return `
        <div class="vehicle-details">
            <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors">
            <div>
                <h2>${data.inv_make} ${data.inv_model} Details</h2>
                <p><span class="vehicle-details-title">Price: </span>$${priceFormatted}</p>
                <p><span class="vehicle-details-title">Description: </span>${data.inv_description}</p>
                <p><span class="vehicle-details-title">Color: </span>${data.inv_color}</p>
                <p><span class="vehicle-details-title">Miles: </span>${milesFormatted}</p>
            </div>
        </div>
    `
}

/* ***************************************
 * Build the vehicle reviews view HTML
 * *************************************** */
Util.buildVehicleReviewsView = async function (reviewsData, account_id) {
    // Start reviews div
    let returnedView = `
        <div class="vehicle-reviews">
            <h2>Reviews</h2>
    `

    // If reviews, loop reviews and create
    if (reviewsData.length > 0) {
        reviewsData.forEach(review => {
            returnedView += `
                <div class="review">
                    <p>${review.review_text}</p>
                    <p class="review-details">${review.account_firstname} ${review.account_lastname}</p>
                    <p class="review-details" id="timestamp">${review.review_date}</p>
            `
            if (review.account_id === account_id) {
                returnedView += `
                    <div class="updateDeleteReview">
                        <a href="/inv/detail/update/${review.review_id}">Update</a>
                        <a href="/inv/detail/delete/${review.review_id}">Delete</a>
                    </div>
                `
            }
            returnedView += `</div>`
        })
    } else {
        returnedView += '<p>No Reviews</p>'
    }

    // Close reviews div
    returnedView += '</div>'

    return returnedView
}

/* ***************************************
 * Middleware for Handling Errors
 * Wrap other function in this for
 * General Error Handling
 * *************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ***************************************
 * Build the classification drop down list
 * *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationDropDown = `
        <select name="classification_id" id="classification_id" required>
            <option value=''>Choose a Classification</option>
    `
    data.rows.forEach((row) => {
        classificationDropDown += `<option value="${row.classification_id}"`
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationDropDown += " selected "
        }
        classificationDropDown += `>${row.classification_name}</option>`
    })
    classificationDropDown += "</select>"
    return classificationDropDown
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

Util.checkEmployeeAdmin = (req, res, next) => {
    if (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin') {
        next()
    } else {
        req.flash("notice", "Permission denied.")
        return res.redirect("/account/login")
    }
}

module.exports = Util