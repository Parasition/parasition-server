const Joi = require("joi");
const logger = require("../../utils/logger");
const { customError } = require("../../utils/error_handler");

/**
 * Validates the campaign creation request object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {*} next - is a function
 * @returns returns error of it is invalid else calls the next function
 */
exports.createCampaignValidation = async (req, res, next) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required().label("Name"),
            objective: Joi.string().required().label("Objective"),
            description: Joi.string().required().label("Description"),
            audios: Joi.array().items(Joi.string()).min(1).required().label("Audios").messages({
                "array.min": "At least one audio file is required.",
            }),
            videos: Joi.array().items(Joi.string()).required().label("Videos"),
            audience: Joi.object({
                age: Joi.object({
                    min: Joi.number(),
                    max: Joi.number(),
                }),
                gender: Joi.object({
                    male: Joi.number(),
                    female: Joi.number(),
                }),
                places: Joi.array().items(
                    Joi.object({
                        place_id: Joi.string().required().label("Place id"),
                        title: Joi.string().required().label("Place title"),
                    })
                ),
            }),
            budget: Joi.object({
                total: Joi.number().required().label("Budget amount"),
                starting_fund: Joi.number(),
                ending_fund: Joi.number(),
            }),
            start_date: Joi.date().iso().required().label("Start date"),
            end_date: Joi.date().iso().required().label("End date"),
        });

        const { value, error } = schema.validate(req.body, { allowUnknown: true });

        if (error) {
            throw customError(error.details[0].message, 422);
        } else {
            next();
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
