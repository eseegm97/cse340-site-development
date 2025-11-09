const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build inventory detail view by inv_id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryById(inv_id)
    // data should be a single vehicle object
    if (!data) {
      return res.status(404).render('errors/error', {
        title: 'Vehicle Not Found',
        message: 'Sorry, we could not find that vehicle.',
        nav: await utilities.getNav(),
      })
    }
    const vehicleDetailHTML = await utilities.buildVehicleDetail(data)
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
      title: data.inv_make + ' ' + data.inv_model,
      nav,
      vehicle: data,
      vehicleDetailHTML,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification form
 * ************************** */
invCont.processAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  // Inline validation
  const errors = []
  
  // Check if classification_name exists and trim whitespace
  const trimmedName = classification_name ? classification_name.trim() : ''
  
  // Required field validation
  if (!trimmedName) {
    errors.push({ msg: "Classification name is required." })
  }
  
  // Length validation
  if (trimmedName && trimmedName.length < 2) {
    errors.push({ msg: "Classification name must be at least 2 characters long." })
  }
  
  // Format validation (only letters and numbers)
  if (trimmedName && !/^[a-zA-Z0-9]+$/.test(trimmedName)) {
    errors.push({ msg: "Classification name can only contain letters and numbers, no spaces or special characters." })
  }
  
  // Check for existing classification
  if (trimmedName && errors.length === 0) {
    const classificationExists = await invModel.checkExistingClassification(trimmedName)
    if (classificationExists) {
      errors.push({ msg: "Classification name already exists. Please use a different name." })
    }
  }
  
  // If validation errors exist, render the form with errors
  if (errors.length > 0) {
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: { array: () => errors },
      classification_name: trimmedName
    })
  }

  // If validation passes, proceed with adding the classification
  const addResult = await invModel.addClassification(trimmedName)

  if (addResult) {
    req.flash(
      "notice",
      `The ${trimmedName} classification was successfully added.`
    )
    // Rebuild navigation to include new classification
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    })
  }
}

/* ***************************
 *  Intentional error trigger for testing error handling
+ * ************************** */
invCont.triggerError = async function (req, res, next) {
  // Intentionally throw an error to test middleware and error handler
  throw new Error('Intentional server error for testing')
}

module.exports = invCont
