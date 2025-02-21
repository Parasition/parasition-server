const jwt = require("jsonwebtoken");
const User = require("./user.model");
const { customError } = require("../../utils/error_handler");
const { keys } = require("../../config/environment");

/**
 * Middleware to check the user is logged in or not.
 * @returns returns error if it is invalid else calls the next function
 */
exports.isUserLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            throw customError("Please login to continue.", 401);
        }
        const decoded = jwt.verify(token.split(" ")[1], keys.SECRET);

        if (!decoded) {
            throw customError("Please login to continue.", 401);
        }

        let userData = await User.findById(decoded.id);
        if (userData) {
            req.authUser = { ...userData.toJSON() };
            next();
        } else {
            throw customError("Please login to continue.", 401);
        }
    } catch (error) {
        next(error);
    }
};
