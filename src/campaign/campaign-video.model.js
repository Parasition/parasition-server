const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const collections = require("../../utils/constants");

const campaignVideoSchema = new Schema({
    campaign: { type: mongoose.Types.ObjectId, ref: collections.campaign, required: true },
    url: { type: String, required: true },
    creator_id: { type: String, required: true },
    creator_social_name: { type: String, required: true },
    desc: { type: String, default: null },
    boost_code: { type: String },
    stats: {
        view_count: { type: Number, default: 0 },
        like_count: { type: Number, default: 0 },
        share_count: { type: Number, default: 0 },
        bookmark_count: { type: Number, default: 0 },
        comment_count: { type: Number, default: 0 },
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
});

module.exports = mongoose.model(collections.video, campaignVideoSchema);
