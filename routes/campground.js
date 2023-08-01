const express = require('express')
const router = express.Router()
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const campgrounds = require('../controllers/campground')

const catchAsync = require('../utils/catchAsync')


/////////////// CRUD operations routes ////////////////
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.create))

router.get('/new', isLoggedIn, campgrounds.newForm)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.Delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit))


module.exports = router
