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
        const price = Math.round(Math.random() * 20) + 10
        const camp = new Campground({
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium, doloribus rem perferendis distinctio quaerat at. Delectus neque itaque quam! Possimus ex incidunt iure sunt eos eum, harum voluptates sapiente cumque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur natus iure enim numquam error deleniti, aliquid molestiae eius nisi sequi excepturi amet exercitationem adipisci illum, inventore repellendus veritatis laboriosam. Voluptates? Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore neque molestiae ipsum similique vitae sit dicta praesentium doloribus ex consequuntur fuga minima voluptates quibusdam voluptatum totam nisi, provident libero. Illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam velit quae aliquid alias ut, tempore est aut consequuntur architecto, cum repellendus delectus, aspernatur nam omnis libero explicabo exercitationem esse perspiciatis.',
            price
        })
        await camp.save()
    }
}

seedDB().then(() => db.close())