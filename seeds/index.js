require('dotenv').config()
const mongoose = require('mongoose')
// importing cloudinary configuration
const { cloudinary } = require('../cloudinary/index')
const cities = require('./cities')
const {places, descriptors, images} = require('./seedHelpers')
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
// Upload the image to Cloudinary
const seedDB = async () => {
    try {
        await Campground.deleteMany({})
        // Delete all images in the YelpCamp folder
        const deleteResult = await cloudinary.api.delete_resources_by_prefix('YelpCamp/');
        console.log(`Deleted ${deleteResult.deleted} images`);
        for(let i = 0; i < 50; i++){
            const randomCity = Math.floor(Math.random() * cities.length)
            const randomImage = Math.floor(Math.random() * images.length)
            const imageUrl = images[randomImage]
            const filename = `YelpCamp/${images[randomImage].split('/').pop()}`; // Extracting filename from URL

            // Check if there are any images in the YelpCamp folder
            const existingImagesInFolder = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'YelpCamp/'
            });

            let uploadedImage = {}
            // Check if image with the same filename exists in the YelpCamp folder
            // const existingImage = existingImagesInFolder.resources.find(resource => resource.url === imageUrl);
            const existingImage = existingImagesInFolder.resources.find(resource => {
                return resource.public_id === uploadedImage.public_id && resource.version === uploadedImage.version;
            });
            if(i === 30 || i === 1){
                console.log('Random image: ', randomImage)
                console.log('filename: ', filename)
                console.log('exisitng image folder: ', existingImagesInFolder)
                console.log('image: ', existingImage)

            }
            
            // uploads image to cloudinary
            if (existingImage) {
                uploadedImage = {
                    secure_url: existingImage.secure_url,
                    public_id: existingImage.public_id
                };
            } else {
                // Upload new image if it doesn't exist
                const result = await cloudinary.uploader.upload(imageUrl, {
                    folder: 'YelpCamp'
                });
                uploadedImage = {
                    secure_url: result.secure_url,
                    public_id: result.public_id
                };
            }
            const price = Math.round(Math.random() * 20) + 10
            const camp = new Campground({
                author: '64c49ff789d238d97f9aa6ea',
                location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                // adds cloudinary image path and filename
                images: [{
                    url: uploadedImage.secure_url,
                    filename: uploadedImage.public_id
                }],
                geometry: {
                    type: 'Point',
                    coordinates: [cities[randomCity].longitude, cities[randomCity].latitude]
                },
                description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium, doloribus rem perferendis distinctio quaerat at. Delectus neque itaque quam! Possimus ex incidunt iure sunt eos eum, harum voluptates sapiente cumque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur natus iure enim numquam error deleniti, aliquid molestiae eius nisi sequi excepturi amet exercitationem adipisci illum, inventore repellendus veritatis laboriosam. Voluptates? Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore neque molestiae ipsum similique vitae sit dicta praesentium doloribus ex consequuntur fuga minima voluptates quibusdam voluptatum totam nisi, provident libero. Illum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam velit quae aliquid alias ut, tempore est aut consequuntur architecto, cum repellendus delectus, aspernatur nam omnis libero explicabo exercitationem esse perspiciatis.',
                price
            })
            await camp.save()
        } 
    } catch (error) {
        console.error('An error occurred: ', error)
    }
}

seedDB().then(() => db.close())