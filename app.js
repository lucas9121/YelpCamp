require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
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


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campground/:id', async (req, res) => {
    res.render('campgrounds/show')
})

app.listen(PORT, () => {
    console.log(`serving on port ${PORT}`)
})
