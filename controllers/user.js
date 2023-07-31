const passport = require('passport')
const User = require('../models/user')

module.exports.registerForm = (req, res) => {
    res.render('users/register', {what: 'New User'})
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.loginForm = (req, res) => {
    res.render('users/login', {what: 'Login'})
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    // req.logout requires a callback to handle errors
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}