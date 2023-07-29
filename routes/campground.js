const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas')
const { isLoggedIn } = require('../middleware')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')


// joi validation
const validateCampground = (req, res, next) => {
    // server side validation
    const {error} = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


/////////////// CRUD operations ////////////////
router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { what: "All Campgounds", campgrounds})
})

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new', {what: "Add Campground"})
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campgground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground)
    newCampground.author = req.user._id
    await newCampground.save()
    //dismissible message
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${newCampground._id}`)
}))


router.get('/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author')
    if(!campground){ 
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground, what: campground.title})
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){ 
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permision to do that')
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    res.render('campgrounds/edit', {what: `Update ${campground.title}`, campground})
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permision to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    // "run validators " update the document according to the schema rules.
    // "new" returns the updated document, rather than the original
    const updatedCampgground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true}, {new: true})

    // dismisible message
    req.flash('success', 'Sucessfully updated campground.')
    res.redirect(`/campgrounds/${updatedCampgground._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Sucessfully deleted campground.')
    res.redirect('/campgrounds')
}))


module.exports = router
