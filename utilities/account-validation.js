const utilities = require('./index')
const { body, validationResult } = require('express-validator')
const accountModel = require('../models/account-model')
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
  return [
    body("email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check login data and return errors or continue to login processing
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      email,
    })
    return
  }
  next()
}

/* ******************************
 * Account Update Data Validation Rules
 * ***************************** */
validate.accountUpdateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database if changed
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = parseInt(req.body.account_id)
        const currentAccount = await accountModel.getAccountById(account_id)
        
        // Only check if email exists if it's being changed
        if (account_email !== currentAccount.account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email exists. Please use a different email")
          }
        }
      }),

    // account_id is required
    body("account_id")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Account ID is required."),
  ]
}

/* ******************************
 * Check account update data and return errors or continue to update processing
 * ***************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      errors,
      title: "Update Account Information",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    })
    return
  }
  next()
}

/* ******************************
 * Password Update Data Validation Rules
 * ***************************** */
validate.passwordUpdateRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    // account_id is required
    body("account_id")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Account ID is required."),
  ]
}

/* ******************************
 * Check password update data and return errors or continue to password update processing
 * ***************************** */
validate.checkPasswordUpdateData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update-account", {
      errors,
      title: "Update Account Information",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    })
    return
  }
  next()
}

module.exports = validate
