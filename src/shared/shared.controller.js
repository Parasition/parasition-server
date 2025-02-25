const { getTikTokVideoData } = require("../../helpers/tikapi");
const logger = require("../../utils/logger");
const { getMetadataFromUrl } = require("../campaign/campaign.common");

/**
 * Fetches the video info
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the video details with message if success else an error message
 */
exports.fetchVideoInfo = async (req, res, next) => {
    try {
        const { link } = req.query;

        const data = await getTikTokVideoData(link);

        return res.status(200).send({ message: "Video info fetched", data: data });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

/**
 * Fetches the video info
 *@param {*} req Express request object
 *@param {*} res Express response object
 *@returns the video details with message if success else an error message
 */
exports.fetchAudioInfo = async (req, res, next) => {
    try {
        const { link } = req.query;

        const data = await getMetadataFromUrl(link);

        return res.status(200).send({ message: "Audio info fetched", data: data });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
