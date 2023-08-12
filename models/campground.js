const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const ImageSchema = new Schema ({
    url: String,
    filename: String
})

// secction 54 video 555
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200,h_150')
})

ImageSchema.virtual('display').get(function(){
    return this.url.replace('/upload', '/upload/w_470,h_350')
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//https://mongoosejs.com/docs/middleware.html
// Query Middleware
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