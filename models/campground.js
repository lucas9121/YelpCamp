const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//https://mongoosejs.com/docs/middleware.html
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // if document was found and deleted
    if(doc){
        await Review.deleteMany({
            _id: {
                // remove all reviews with an id in that document
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema)