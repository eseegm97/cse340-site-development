const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
	let nav = await utilities.getNav()
	res.render('account/login', {
		title: 'Login',
		nav,
    errors: null
	})
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render('account/account-management', {
    title: 'Account Management',
    nav,
    errors: null
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { email, password } = req.body
  const accountData = await accountModel.getAccountByEmail(email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      email,
    })
    return
  }
  try {
    if (await bcrypt.compare(password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  
  // Get account data to populate form
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render('account/update-account', {
    title: 'Update Account Information',
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id
  })
}

/* ****************************************
 *  Process account information update
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    req.flash("notice", "Account information has been successfully updated.")
    
    // Query the updated account data from the database
    const updatedAccountData = await accountModel.getAccountById(account_id)
    
    // Update the JWT token with new information
    if (updatedAccountData) {
      delete updatedAccountData.account_password
      const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
    }
    
    res.status(200).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

/* ****************************************
 *  Process password change
 * *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  // Hash the new password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    const accountData = await accountModel.getAccountById(account_id)
    res.status(500).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
    return
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", "Password has been successfully updated.")
    res.status(200).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout, buildUpdateAccount, updateAccount, updatePassword }