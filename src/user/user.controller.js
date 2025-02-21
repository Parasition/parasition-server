const User = require("./user.model");
const logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");
const { keys } = require("../../config/environment");
const { customError } = require("../../utils/error_handler");

/**
 *Register user with provided data
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the registered admin with message if success else an error message
 */
exports.registerUser = async (req, res, next) => {
    try {
        const { name, business_name, phone_number, email, password, address } = req.body;

        const user = await User.findOne({ email, deleted_at: null });

        if (user) {
            throw customError("User already registered with this email", 409);
        }

        let newUser = new User({
            name,
            business_name,
            phone_number,
            email,
            password,
            address,
        });

        await newUser.save();

        return res.status(201).send({ message: "Account registered. Please login to continue" });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

/**
 *Login admin
 *@param {*} req http request object
 *@param {*} res http response object
 *@returns returns the success or fail or error with message and data if exists
 */
exports.userLogin = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        let queryFilter = {
            email,
            deleted_at: null,
        };

        let user = await User.findOne(queryFilter);

        if (!user) {
            throw customError("No user found with this details", 401);
        }

        if (!user.comparePassword(password)) {
            throw customError("Incorrect password", 401);
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            keys.SECRET,
            { expiresIn: keys.TOKEN_EXPIRY || "1d" }
        );
        user.password = undefined;
        return res.status(200).send({ message: "Login success", token, data: user });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
