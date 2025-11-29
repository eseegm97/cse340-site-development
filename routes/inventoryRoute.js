const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory management view - ADMIN ONLY
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Route to build add classification view - ADMIN ONLY
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification form - ADMIN ONLY
router.post("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.processAddClassification));

// Route to build add inventory view - ADMIN ONLY
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Route to process add inventory form - ADMIN ONLY
router.post("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.processAddInventory));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to get inventory by classification as JSON - ADMIN ONLY (used for admin forms)
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Intentional error route for testing error handling
router.get("/error-test", utilities.handleErrors(invController.triggerError));

// Route to build inventory edit view - ADMIN ONLY
router.get("/edit/:inventory_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));

// Route to handle incoming requests - ADMIN ONLY
router.post("/update/", utilities.checkAccountType, utilities.handleErrors(invController.updateInventory));

// Route to get delete view - ADMIN ONLY
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Process delete inventory - ADMIN ONLY
router.post("/delete/", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

module.exports = router;