const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to process add classification form
router.post(
  "/add-classification", 
  utilities.handleErrors(invController.processAddClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// Route to process add inventory form
router.post(
  "/add-inventory", 
  utilities.handleErrors(invController.processAddInventory)
);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Intentional error route for testing error handling
router.get("/error-test", utilities.handleErrors(invController.triggerError));

// Route to build inventory edit view
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory));

// Route to handle incoming requests
router.post("/update/", utilities.handleErrors(invController.updateInventory));

module.exports = router;