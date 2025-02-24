const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collections = require("../../utils/constants");

const campaignSchema = new Schema({
    name: { type: String, required: [true, "Please provide name"] },
    objective: { type: String, required: [true, "Please provide objective"] },
    description: { type: String, required: [true, "Please provide description"] },
    audios: { type: [String], required: [true, "Please provide audio file links"] },
    videos: { type: [String], required: [true, "Please provide example video file links"] },
    campaign_code: { type: String, required: true },
    audience: {
        age: {
            min: { type: Number },
            max: { type: Number },
        },
        gender: {
            male: { type: Number },
            female: { type: Number },
        },
        places: [
            {
                _id: false,
                place_id: { type: String },
                title: { type: String },
            },
        ],
    },
    budget: {
        total: { type: Number, required: true },
        starting_fund: { type: Number },
        ending_fund: { type: Number },
    },
    start_date: { type: Date, required: [true, "Please provide campaign start date"] },
    end_date: { type: Date, required: [true, "Please provide campaign end date"] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model(collections.campaign, campaignSchema);
