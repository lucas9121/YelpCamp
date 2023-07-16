require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const PORT = process.env.port || 3000
const Campground = require('./models/campground')

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


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//parses req.body in the post request
app.use(express.urlencoded({extended: true}))
// tricks form into thinking other requets are post request
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground)
    await newCampground.save()
    res.redirect(`/campground/${newCampground._id}`)
})


app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // console.log(campground)
    res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground})
})

app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params
    const campgground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true})
    res.redirect(`/campgrounds/${campgground._id}`)
})





app.listen(PORT, () => {
    console.log(`serving on port ${PORT}`)
})
