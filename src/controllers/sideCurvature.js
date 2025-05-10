import SideCurvature from "../models/sideCurvature.js";
import responseHelper from '../helpers/responseHelper.js';

export const sideCurvaturePage = (req, res) => {
    res.render('product/side_curvature', {
        title: 'Side Curvature',
        page: 'side_curvature'
    })
}

export const getSideCurvatures = async (req, res) => {
    try {
        const sideCurvatures = await SideCurvature.find();
        responseHelper.success(res, sideCurvatures)
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const createSideCurvature = async (req, res) => {
    try {
        const sideCurvature = new SideCurvature({});
        await sideCurvature.save();
        responseHelper.success(res, sideCurvature, 'Added');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const updateSideCurvature = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = await SideCurvature.findOne({
            name,
            _id: { $ne: id }
        });
        if (existing) {
            return responseHelper.error(res, `${name} already exists.`);
        }

        const updateSideCurvature = await SideCurvature.findByIdAndUpdate(id, { name, description }, { new: true });
        responseHelper.success(res, updateSideCurvature, 'Updated')
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const deleteSideCurvatures = async (req, res) => {
    try {
        const { selectedSideCurvatures } = req.body;
        const result = await SideCurvature.deleteMany({
            _id: { $in: selectedSideCurvatures }
        })
        responseHelper.success(res, result.deletedCount, 'Deleted');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}