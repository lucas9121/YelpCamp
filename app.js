require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const PORT = process.env.port || 3000


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
//static assets for images and custom style sheets
app.use(express.static(path.join(__dirname, 'public')))


/////// using cookies ////////
// https://owasp.org/www-community/
const sessionConfig = {
    secret:'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // default is set to true
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }

}
app.use(session(sessionConfig))
// flash messages
app.use(flash())

app.use((req, res, next) => {
    // under every request will take flash and place under the key in locals
    res.locals.success  = req.flash('success')
    res.locals.error  = req.flash('error')
    next()
})





/////////////// Routes ////////////////
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute )









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
