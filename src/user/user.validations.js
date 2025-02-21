const Joi = require("joi");
const logger = require("../../utils/logger");
const { customError } = require("../../utils/error_handler");

/**
 * Validates the user register request object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {*} next - is a function
 * @returns returns error of it is invalid else calls the next function
 */
exports.registerUserValidation = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().label("Email"),
            password: Joi.string().required().label("Password"),
            name: Joi.string().required().label("Name"),
            business_name: Joi.string().required().label("Business name"),
            phone_number: Joi.string().required().label("Phone number"),
            address: Joi.string().required().label("Address"),
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

/**
 * Validate the login request object
 * @param {object} req - http request object
 * @param {object} req- http request object
 * @param {*} next - is as function
 * @returns returns a error if it is invalid else calls the next function
 */
exports.loginValidation = async (req, res, next) => {
    try {
        let schema = Joi.object({
            email: Joi.string().required().label("Email"),
            password: Joi.string().required().label("Password"),
        });
        const { value, error } = schema.validate(req.body, { allowUnknown: true });
        if (error) {
            throw customError(error.details[0].message);
        } else {
            next();
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
