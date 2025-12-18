const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

// Should throw a 500 error because the title and nav are not provided to res.render
baseController.error500 = async function(req, res) {
    res.render("index")
}

module.exports = baseController
