require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const {campgroundSchema, reviewSchema} = require('./schemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const PORT = process.env.port || 3000
const Campground = require('./models/campground')
const Review = require('./models/review')
const campgroundRoute = require('./routes/campground')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const db = mongoose.connection;
//if error, then show error
db.on("error", console.error.bind(console, "connection error:"));
//otherwise console log connected
db.once("open", () => {
    console.log("Database connected")
})


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))




////////// Middleware ///////////////
//parses req.body in the post request
app.use(express.urlencoded({extended: true}))

// tricks form into thinking other requets are post request
app.use(methodOverride('_method'))



// joi validation
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

/////////////// CRUD operations ////////////////
app.use('/campgrounds', campgroundRoute)


/////////////// CRUD operations ////////////////
app.get('/', (req, res) => {
    res.render('home', {what: 'Home'})
})


///// Reviews
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params
    //$pull operator removes from an existing array all instances of a value that match the specified condition.
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))



//catch all
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


//////////////// Error Handler ////////////////////
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No! Something went wrong.'
    console.log(err.stack)
    res.status(statusCode).render('error', { err, what: 'Error'})
})



app.listen(PORT, () => {
    console.log(`serving on port ${PORT}`)
})
