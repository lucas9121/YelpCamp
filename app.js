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
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user')
const helmet = require('helmet')
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


// Safety Mongo Injection
// searches for any keys in objects that begin with a "$" sign or contain a ".", from req.body, req.query or req.params
app.use(mongoSanitize());




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
    name: 'session', // changing the name of the cookie for security purposes
    secret:'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // default is set to true
        // secure: true, // only works in https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }

}
app.use(session(sessionConfig))
// flash messages
app.use(flash())

//updates header to add security measures against attacks
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
app.get('/', (req, res) => {
    res.render('home', {what: 'Home'})
})


app.use('/', usersRoute)
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute )


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
