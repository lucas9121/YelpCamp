const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas')
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

router.get('/', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { what: "All Campgounds", campgrounds})
})

router.get('/new', (req, res) => {
    res.render('campgrounds/new', {what: "Add Campground"})
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campgground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))


router.get('/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', {campground, what: campground.title})
}))

router.get('/:id/edit', catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {what: `Update ${campground.title}`, campground})
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params
    // "run validators " update the document according to the schema rules.
    // "new" returns the updated document, rather than the original
    const campgground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true}, {new: true})
    res.redirect(`/campgrounds/${campgground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))


module.exports = router
