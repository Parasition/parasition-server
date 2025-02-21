const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const collections = require("../../utils/constants");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    business_name: {
        type: String,
        required: [true, "Business name is required"],
    },
    phone_number: {
        type: String,
        required: [true, "Phone number is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        validate: {
            validator: function (value) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
            },
            message: "Please enter a valid email address.",
        },
    },
    password: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
});

userSchema.methods.comparePassword = function (requestedPassword) {
    return bcrypt.compareSync(requestedPassword, this.password);
};

userSchema.pre("save", function (next) {
    const user = this;
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model(collections.user, userSchema);
