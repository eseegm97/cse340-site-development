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
    })
  } catch (error) {
    next(error)
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