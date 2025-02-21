const Campaign = require("./campaign.model");
const CampaignVideo = require("./campaign-video.model");
const logger = require("../../utils/logger");
const { customError } = require("../../utils/error_handler");
const moment = require("moment");
const { getMetadataFromUrl } = require("./campaign.common");
const collections = require("../../utils/constants");

/**
 * Creates the campaign
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the registered admin with message if success else an error message
 */
exports.createCampaign = async (req, res, next) => {
    try {
        const { objective, description, audios, videos, budget, start_date, end_date } = req.body;

        const metadata = await getMetadataFromUrl(audios[0]);
        let campaign_code =
            (metadata?.common?.title.split("")[0] || "U") + (metadata?.common?.artist.split("")[0] || "U");

        const campaigns = await Campaign.find({ campaign_code: { $regex: campaign_code, $options: "i" } });
        if (campaigns.length > 0) {
            campaign_code = campaign_code + campaigns.length;
        }

        let newCampaign = new Campaign({
            objective,
            description,
            audios,
            videos,
            campaign_code,
            budget,
            start_date,
            end_date,
        });

        const savedCamapign = await newCampaign.save();

        return res.status(201).send({ message: "Campaign created", data: savedCamapign });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

/**
 * Extends the campaign
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the registered admin with message if success else an error message
 */
exports.extendCampaign = async (req, res, next) => {
    try {
        const { _id, start_date, end_date, budget } = req.body;

        const campaign = await Campaign.findOne({ _id });

        if (!campaign) {
            throw customError("Campaign not found", 404);
        }

        if (start_date && campaign.start_date < Date.now()) {
            throw customError("Campaign start date can't be modified beacuase it is already started");
        }

        if (start_date && new Date(start_date) < Date.now()) {
            throw customError("New campaign can't be a past date");
        }

        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            throw customError("Campaign end date should be greater than start date");
        }

        campaign.start_date = start_date;
        campaign.end_date = end_date;
        campaign.budget.total = budget;

        const updatedData = await campaign.save();

        return res.status(200).send({ message: "Campaign details updated", data: updatedData });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

/**
 * Get all campaigns
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the campaigns with message if success else an error message
 */
exports.getCampaigns = async (req, res, next) => {
    try {
        const campaigns = await Campaign.aggregate([
            { $match: { deleted_at: null } },
            {
                $lookup: {
                    from: collections.video,
                    localField: "_id",
                    foreignField: "campaign",
                    as: "creator_videos",
                },
            },
        ]);

        return res.status(200).send({ message: "Campaigns fetched", data: campaigns });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

/**
 * Get campaign details
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the campaigns with message if success else an error message
 */
exports.getCampaignDetails = async (req, res, next) => {
    try {
        const { _id, campaign_code } = req.query;

        if (!_id && !campaign_code) {
            throw customError("At least one of id or campaign_code is required");
        }

        const campaign = await Campaign.findOne({
            $or: [{ _id: req.query._id }, { campaign_code: req.query.campaign_code }],
        });

        if (!campaign) {
            throw customError("No campaign found with this id", 404);
        }

        const campaignVideos = await CampaignVideo.aggregate([
            { $match: { campaign: campaign._id } },
            {
                $lookup: {
                    from: collections.video_stats,
                    localField: "campaign",
                    foreignField: "campaign",
                    as: "creator_videos_stats",
                },
            },
        ]);

        const data = Object.assign(campaign.toJSON(), { videos: campaignVideos });

        return res.status(200).send({ message: "Campaign details fetched", data });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
