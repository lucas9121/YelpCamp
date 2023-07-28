const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const {storeReturnTo} = require('../middleware')




//////////////////// Routes ///////////////////////
router.get('/register', (req, res) => {
    res.render('users/register', {what: 'New User'})
})

//// Register new user ////
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {email, username, password} = req.body
        const user = new User({email, username})
        const newUser = await User.register(user, password)
        //passpot logs in new user
        req.login(newUser, err => {
            // error callback
            if(err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => [
    res.render('users/login', {what: 'Login'})
])

////  Log in user ////
router.post('/login', 
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), 
    // Now I can use res.locals.returnTo to redirect the user after login
    (req, res) => {
        req.flash('success', 'Welcome back!')
        const redirectUrl = res.locals.returnTo || '/campgrounds'
        res.redirect(redirectUrl)
    }
)


////  Log out user ////
router.get('/logout', (req, res, next) => {
    // req.logout requires a callback to handle errors
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});


module.exports = router