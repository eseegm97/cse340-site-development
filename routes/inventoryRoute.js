const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle details view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleDetailsView))

// Process add review
router.post(
    "/detail/:inventoryId",
    inventoryValidate.addReviewRules(),
    inventoryValidate.checkAddReviewData,
    utilities.checkLogin,
    utilities.handleErrors(invController.addReview)
)

// Route to build update review view
router.get(
    "/detail/update/:review_id",
    utilities.checkLogin,
    utilities.handleErrors(invController.buildUpdateReviewView)
)

// Process update review
router.post(
    "/detail/update/:review_id",
    inventoryValidate.addReviewRules(),
    inventoryValidate.checkUpdateReviewData,
    utilities.checkLogin,
    utilities.handleErrors(invController.updateReview)
)

// Route to bulid confirm delete review view
router.get(
    "/detail/delete/:review_id",
    utilities.checkLogin,
    utilities.handleErrors(invController.buildConfirmDeleteReviewView)
)

// Process delete review
router.post(
    "/detail/delete/:review_id",
    utilities.checkLogin,
    utilities.handleErrors(invController.deleteReview)
)

// Route to build management view
router.get(
    "/", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.buildManagementView)
)

// Route to build add classification view
router.get(
    "/add-classification", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.buildAddClassificationView)
)

// Route to build add inventory view
router.get(
    "/add-inventory", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.buildAddInventoryView)
)

// Process adding a new classification
router.post(
    "/add-classification",
    inventoryValidate.newClassificationRules(),
    inventoryValidate.checkNewClassificationData,
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.addNewClassification)
)

// Process adding a new inventory
router.post(
    "/add-inventory",
    inventoryValidate.newInventoryRules(),
    inventoryValidate.checkNewInventoryData,
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.addNewInventory)
)

// Route to get edit inventory info
router.get(
    "/getInventory/:classification_id", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.getInventoryJSON)
)

// Route to modify inventory
router.get(
    "/edit/:inventory_id",
    utilities.checkLogin, 
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.modifyInventoryView)
)

// Process modify inventory
router.post(
    "/update/", 
    inventoryValidate.newInventoryRules(),
    inventoryValidate.checkUpdateData,
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.updateInventory)
)

// Route to get delete view
router.get(
    "/delete/:inv_id", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.deleteInventoryView)
)

// Process delete inventory
router.post(
    "/delete/", 
    utilities.checkLogin,
    utilities.checkEmployeeAdmin,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router