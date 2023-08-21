const BaseJoi = require('joi')
const sanitizeHTML = require('sanitize-html')
//https://joi.dev/api/?v=17.9.1


// making my own validation
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // options to what is allowed. Nothing for this 
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                // check if there is a difference between input and sanitized output
                if(clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

// adding my extension function 
const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
})