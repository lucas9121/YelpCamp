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
const reviewRoute = require('./routes/review')

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





/////////////// CRUD operations ////////////////
app.use('/campgrounds', campgroundRoute)
app.use('/', reviewRoute )


/////////////// CRUD operations ////////////////
app.get('/', (req, res) => {
    res.render('home', {what: 'Home'})
})






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
