const mongoose = require("mongoose");

/**
 * To check the id object id or not
 * @param {string} id - mongodb object id
 * @returns {boolean} - returns a boolean value
 */

const isValidMongoId = id => {
    let isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        return false;
    } else {
        return true;
    }
};

module.exports = isValidMongoId;
