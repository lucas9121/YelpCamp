const express = require('express')
const router = express.Router()
const passport = require('passport')
const users = require('../controllers/user')
const catchAsync = require('../utils/catchAsync')
const {storeReturnTo} = require('../middleware')




//////////////////// Routes ///////////////////////
//// Register new user ////
router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.register))


////  Log in user ////
router.route('/login')
    .get(users.loginForm)
    .post(storeReturnTo, // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), // logs the user in and clears req.session
    users.login // Now I can use res.locals.returnTo to redirect the user after login
    )


////  Log out user ////
router.get('/logout', users.logout);


module.exports = router