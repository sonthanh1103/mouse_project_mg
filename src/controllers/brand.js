import Brand from "../models/brand.js";
import responseHelper from '../helpers/responseHelper.js'

export const brandPage = (req, res) => {
    res.render('product/brand', {
        title: 'Brand',
        page: 'brand'
    })
}

// export const getBrands = async (req, res) => {
//     try {
//         const { s } = req.query;
//         const filter = {};
//         if (s) {
//             filter["$or"] = [
//                 { name: { $regex: s, $options: 'i'}},
//                 { description: { $regex: s, $options: 'i'}}
//             ]
//         }
//         const brands = await Brand.find(filter);
//         responseHelper.success(res, brands)
//     } catch (error) {
//         responseHelper.error(res, error.message);
//     }
// }

export const getBrands = async (req, res) => {
    try {
        const getData = await Brand.find().sort({ createdAt: -1 });
        responseHelper.success(res, getData);
    } catch (error) {
        responseHelper.error(res, error.message)
    }
}

export const createBrand = async (req, res) => {
    try {
        const brand = new Brand({});
        await brand.save();
        responseHelper.success(res, brand, 'Added');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existedId = await Brand.findById(id);
        if (!existedId) {
           return responseHelper.error(res, `${id} Not Found`);
        }

        const existing = await Brand.findOne({
            name,
            _id: { $ne: id }
        });
        if (existing) {
            return responseHelper.error(res, `${name} already exists.`);
        }

        const updateBrand = await Brand.findByIdAndUpdate(id, { name, description }, { new: true });
        responseHelper.success(res, updateBrand, 'Updated')
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const deleteBrands = async (req, res) => {
    try {
        const { brandIds } = req.body;
        const result = await Brand.deleteMany({
            _id: { $in: brandIds }
        })
        responseHelper.success(res, result.deletedCount, 'Deleted');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}