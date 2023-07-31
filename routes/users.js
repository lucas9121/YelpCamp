const express = require('express')
const router = express.Router()
const passport = require('passport')
const users = require('../controllers/user')
const catchAsync = require('../utils/catchAsync')
const {storeReturnTo} = require('../middleware')




//////////////////// Routes ///////////////////////
router.get('/register', users.registerForm)

//// Register new user ////
router.post('/register', catchAsync(users.register))

router.get('/login', users.loginForm)

////  Log in user ////
router.post('/login', 
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), 
    // Now I can use res.locals.returnTo to redirect the user after login
    users.login
)


////  Log out user ////
router.get('/logout', users.logout);


module.exports = router