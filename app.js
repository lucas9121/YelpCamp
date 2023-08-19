if(process.env.NODE_ENV !== "produciion"){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const PORT = process.env.port || 3000


const campgroundRoute = require('./routes/campground')
const reviewRoute = require('./routes/review')
const usersRoute = require('./routes/users')

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


// passport package
// https://www.passportjs.org/docs/
app.use(passport.initialize())
app.use(passport.session())
// use local stratgy to activate the authenticate method on user meodel that was added by passport
passport.use(new LocalStrategy(User.authenticate()))
// stores user in session
passport.serializeUser(User.serializeUser())
// gets user out of session
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    // in every request set user to current user
    res.locals.currentUser = req.user
    // under every request will take flash and place under the key in locals
    res.locals.success  = req.flash('success')
    res.locals.error  = req.flash('error')
    next()
})





/////////////// Routes ////////////////
app.use('/', usersRoute)
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute )

app.get('/', (req, res) => {
    res.render('home', {what: 'Home'})
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({email: 'test@gmail.com', username: 'testUSer'})
    // Static methods for passport
    // https://github.com/saintedlama/passport-local-mongoose
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})









//catch all
app.get('/*', (req, res, next) => {
    console.log('Catch-all route triggered:', req.url);
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
