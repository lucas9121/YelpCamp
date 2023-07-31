const express = require('express')
// brings params from the app file to the router
const router = express.Router({mergeParams: true})
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/review')
const catchAsync = require('../utils/catchAsync')




/////////////// CRUD operations routes////////////////
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.create))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.Delete))





module.exports = router