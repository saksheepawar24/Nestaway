const Joi = require('joi');
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string().valid("Trending", "Rooms", "Iconic Cities", "Mountains", "Beaches", "Camping", "Farms", "Castles").required(),
    }).required(),
    coverIndex: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    replaceImages: Joi.string().optional()
});

//Reviews Schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        comment: Joi.string().required()
    }).required()
});