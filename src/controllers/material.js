import Material from "../models/material.js";
import responseHelper from '../helpers/responseHelper.js'

export const materialPage = (req, res) => {
    res.render('product/material', {
        title: 'Material',
        page: 'material'
    })
}

export const getMaterials = async (req, res) => {
    try {
        const { s } = req.query;
        const filter = {};
        if (s) {
            filter["$or"] = [
                { name: { $regex: s, $options: 'i' }},
                { description: { $regex: s, $options: 'i' }}
            ]
        }
        const materials = await Material.find(filter);
        responseHelper.success(res, materials)
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const createMaterial = async (req, res) => {
    try {
        const material = new Material({});
        await material.save();
        responseHelper.success(res, material, 'Added');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = await Material.findOne({
            name,
            _id: { $ne: id }
        });
        if (existing) {
            return responseHelper.error(res, `${name} already exists.`);
        }

        const updateMaterial = await Material.findByIdAndUpdate(id, { name, description }, { new: true });
        responseHelper.success(res, updateMaterial, 'Updated')
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const deleteMaterials = async (req, res) => {
    try {
        const { materialIds } = req.body;
        const result = await Material.deleteMany({
            _id: { $in: materialIds }
        })
        responseHelper.success(res, result.deletedCount, 'Deleted');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}