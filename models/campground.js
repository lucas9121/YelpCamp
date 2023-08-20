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


// mongoose will add virtual to JSON data
const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts)

// nested virtual to add properties key to schema
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
        <div class="d-flex flex-column align-items-center pt-1 gap-1">
            <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
            <small class="text-muted fw-bold"> $${this.price}/night</small>
        </div>
    `
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