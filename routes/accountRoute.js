const express = require('express')
const router = new express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities/')
const regValidate = require('../utilities/account-validation')

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

module.exports = { buildLogin }

// Route to display login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to display registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to display account management view
router.get("/", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to process registration
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// Route to display update account view
router.get("/update/:account_id", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to process account information update
router.post(
  "/update-account",
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password update
router.post(
  "/update-password",
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router