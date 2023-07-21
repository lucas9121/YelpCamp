require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const {campgroundSchema} = require('./schemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const PORT = process.env.port || 3000
const Campground = require('./models/campground')
const Review = require('./models/review')

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
app.get('/', (req, res) => {
    res.render('home', {what: 'Home'})
})

app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { what: "All Campgounds", campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', {what: "Add Campground"})
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campgground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)
}))


app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    // console.log(campground)
    res.render('campgrounds/show', {campground, what: campground.title})
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {what: `Update ${campground.title}`, campground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params
    // "run validators " update the document according to the schema rules.
    // "new" returns the updated document, rather than the original
    const campgground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true}, {new: true})
    res.redirect(`/campgrounds/${campgground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

// Reviews
app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
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
