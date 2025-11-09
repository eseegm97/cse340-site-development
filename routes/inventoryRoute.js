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

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Intentional error route for testing error handling
router.get("/error-test", utilities.handleErrors(invController.triggerError));

module.exports = router;