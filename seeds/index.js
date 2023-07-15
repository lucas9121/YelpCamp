require('dotenv').config()
const mongoose = require('mongoose')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})


const sample = arr => arr[Math.floor(Math.random() * arr.length)]
const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++){
        const randomCity = Math.floor(Math.random() * cities.length)
        const camp = new Campground({
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save()
    }
}

seedDB().then(() => db.close())