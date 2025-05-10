import FrontFlare from "../models/frontFlare.js";
import responseHelper from '../helpers/responseHelper.js';

export const frontFlarePage = (req, res) => {
    res.render('product/front_flare', {
        title: 'Front Flare',
        page: 'front_flare'
    })
}

export const getFrontFlares = async (req, res) => {
    try {
        const frontFlare = await FrontFlare.find();
        responseHelper.success(res, frontFlare)
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const createFrontFlare = async (req, res) => {
    try {
        const frontFlare = new FrontFlare({});
        await frontFlare.save();
        responseHelper.success(res, frontFlare, 'Added');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const updateFrontFlare = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = await FrontFlare.findOne({
            name,
            _id: { $ne: id }
        });
        if (existing) {
            return responseHelper.error(res, `${name} already exists.`);
        }

        const updateFrontFlare = await FrontFlare.findByIdAndUpdate(id, { name, description }, { new: true });
        responseHelper.success(res, updateFrontFlare, 'Updated')
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const deleteFrontFlares = async (req, res) => {
    try {
        const { selectedFrontFlares } = req.body;
        const result = await FrontFlare.deleteMany({
            _id: { $in: selectedFrontFlares }
        })
        responseHelper.success(res, result.deletedCount, 'Deleted');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}