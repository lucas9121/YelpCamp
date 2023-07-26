import mongoose from 'mongoose';
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
})
// passport package
// https://www.passportjs.org/docs/
// https://github.com/saintedlama/passport-local-mongoose
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)