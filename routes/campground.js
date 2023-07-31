const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const campgrounds = require('../controllers/campground')

const catchAsync = require('../utils/catchAsync')


/////////////// CRUD operations routes ////////////////
router.get('/', campgrounds.index)

router.get('/new', isLoggedIn, campgrounds.newForm)

router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.create))

router.get('/:id', catchAsync(campgrounds.show))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.update))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.Delete))

module.exports = router
