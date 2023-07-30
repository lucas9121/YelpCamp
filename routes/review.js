const express = require('express')
// brings params from the app file to the router
const router = express.Router({mergeParams: true})
const Review = require('../models/review')
const Campground = require('../models/campground')
const {validateReview, isLoggedIn} = require('../middleware')
const catchAsync = require('../utils/catchAsync')




/////////////// CRUD operations ////////////////
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params
    //$pull operator removes from an existing array all instances of a value that match the specified condition.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review sucessfully deleted.')
    res.redirect(`/campgrounds/${id}`)
}))





module.exports = router