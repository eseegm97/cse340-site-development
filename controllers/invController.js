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
  const classificationSelect = await utilities.buildClassificationList()
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
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
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
 *  Process add inventory form
 * ************************** */
invCont.processAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body

  // Inline validation
  const errors = []
  
  // Required field validations
  if (!inv_make || !inv_make.trim()) {
    errors.push({ msg: "Make is required." })
  }
  if (!inv_model || !inv_model.trim()) {
    errors.push({ msg: "Model is required." })
  }
  if (!inv_year || !inv_year.trim()) {
    errors.push({ msg: "Year is required." })
  } else if (!/^\d{4}$/.test(inv_year)) {
    errors.push({ msg: "Year must be a 4-digit number." })
  } else {
    const year = parseInt(inv_year)
    const currentYear = new Date().getFullYear()
    if (year < 1900 || year > currentYear + 1) {
      errors.push({ msg: `Year must be between 1900 and ${currentYear + 1}.` })
    }
  }
  if (!inv_description || !inv_description.trim()) {
    errors.push({ msg: "Description is required." })
  }
  if (!inv_image || !inv_image.trim()) {
    errors.push({ msg: "Image path is required." })
  } else if (!inv_image.startsWith('/images/')) {
    errors.push({ msg: "Image path must start with '/images/'." })
  }
  if (!inv_thumbnail || !inv_thumbnail.trim()) {
    errors.push({ msg: "Thumbnail path is required." })
  } else if (!inv_thumbnail.startsWith('/images/')) {
    errors.push({ msg: "Thumbnail path must start with '/images/'." })
  }
  if (!inv_price || isNaN(inv_price) || parseFloat(inv_price) < 0) {
    errors.push({ msg: "Price must be a valid number greater than or equal to 0." })
  }
  if (!inv_miles || isNaN(inv_miles) || parseInt(inv_miles) < 0) {
    errors.push({ msg: "Mileage must be a valid number greater than or equal to 0." })
  }
  if (!inv_color || !inv_color.trim()) {
    errors.push({ msg: "Color is required." })
  }
  if (!classification_id) {
    errors.push({ msg: "Please select a classification." })
  }
  
  // If validation errors exist, render the form with errors
  if (errors.length > 0) {
    // Rebuild classification list with selected value
    classificationList = await utilities.buildClassificationList(classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: { array: () => errors },
      inv_make: inv_make || '',
      inv_model: inv_model || '',
      inv_year: inv_year || '',
      inv_description: inv_description || '',
      inv_image: inv_image || '',
      inv_thumbnail: inv_thumbnail || '',
      inv_price: inv_price || '',
      inv_miles: inv_miles || '',
      inv_color: inv_color || '',
      classification_id: classification_id || ''
    })
  }

  // If validation passes, proceed with adding the inventory item
  const addResult = await invModel.addInventory(
    inv_make.trim(), 
    inv_model.trim(), 
    inv_year, 
    inv_description.trim(), 
    inv_image.trim(), 
    inv_thumbnail.trim(), 
    parseFloat(inv_price), 
    parseInt(inv_miles), 
    inv_color.trim(), 
    parseInt(classification_id)
  )

  if (addResult) {
    req.flash(
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} was successfully added to inventory.`
    )
    // Rebuild navigation in case new classification was used
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the vehicle could not be added to inventory.")
    classificationList = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
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
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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

module.exports = invCont
