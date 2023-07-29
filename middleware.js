const Campgound = require('./models/campground')
const Review = require('./models/review')
const {campgroundSchema, reviewSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError')

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}

// transfer "returnTo" value from session to expressJS locals object
module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next()
}

// joi validation for campground
module.exports.validateCampground = (req, res, next) => {
    // server side validation
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permision to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// joi validation for review
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}