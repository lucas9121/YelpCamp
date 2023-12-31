const express = require('express')
const router = express.Router()
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const campgrounds = require('../controllers/campground')

// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
// https://www.npmjs.com/package/multer
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

const catchAsync = require('../utils/catchAsync')


/////////////// CRUD operations routes ////////////////
router.route('/')
    .get(catchAsync(campgrounds.index))
    // upload can't go before validation in the long run. Need to fix this.
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create))

    
router.get('/new', isLoggedIn, campgrounds.newForm)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    // upload can't go before validation in the long run. Need to fix this.
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.Delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit))


module.exports = router
