const Campaign = require("./campaign.model");
const CampaignVideo = require("./campaign-video.model");
const logger = require("../../utils/logger");
const { customError } = require("../../utils/error_handler");
const moment = require("moment");
const path = require("path");
const { getMetadataFromUrl } = require("./campaign.common");
const collections = require("../../utils/constants");
const { spawn } = require("child_process");

/**
 * Creates the campaign
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the registered admin with message if success else an error message
 */
exports.createCampaign = async (req, res, next) => {
    try {
        const { name, objective, description, audios, videos, budget, start_date, end_date } = req.body;

        const metadata = await getMetadataFromUrl(audios[0]);
        let campaign_code = (metadata?.title.split("")[0] || "U") + (metadata?.authorName.split("")[0] || "U");

        const campaigns = await Campaign.find({ campaign_code: { $regex: campaign_code, $options: "i" } });
        if (campaigns.length > 0) {
            campaign_code = campaign_code + campaigns.length;
        }

        let newCampaign = new Campaign({
            name,
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

        const currentDate = new Date(moment().startOf("day"));
        const campaignStartDate = new Date(campaign.start_date);

        // Check if the campaign has started (current date >= start date)
        const hasStarted = currentDate >= campaignStartDate;

        // Check if new dates are valid
        const isValidStartDate = new Date(start_date) >= currentDate;
        const isValidEndDate = new Date(end_date) >= currentDate;

        if (hasStarted) {
            if (!isValidEndDate) {
                throw customError("End date must be current or a future date.", 422);
            }
            campaign.end_date = end_date;
        } else {
            if (!isValidStartDate) {
                throw customError("Start date  must be current or future date.", 422);
            }
            if (!isValidEndDate) {
                throw customError("End date  must be current or future date.", 422);
            }

            if (new Date(start_date) >= new Date(end_date)) {
                throw customError("End date must be greater than start date.", 422);
            }

            campaign.start_date = start_date;
            campaign.end_date = end_date;
        }

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
                    pipeline: [
                        {
                            $lookup: {
                                let: { creator: "$creator_id" },
                                from: collections.video_stats,
                                localField: "campaign",
                                foreignField: "campaign",
                                as: "video_stats",
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$creator_id", "$$creator"],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
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

/**
 * Generates brief
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the video links with message if success else an error message
 */
exports.generateBrief = async (req, res, next) => {
    try {
        const { link } = req.body;

        // const metadata = await getMetadataFromUrl(audios[0]);

        const python_file_path = path.join(__dirname, `python/main.py`);

        const pythonProcess = spawn("python", [python_file_path, "7 rings", "Ariana grande"]);

        pythonProcess.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });

        pythonProcess.stderr.on("data", data => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on("close", code => {
            console.log("close");
        });

        return res.status(200).send({ message: "Campaign details fetched" });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
