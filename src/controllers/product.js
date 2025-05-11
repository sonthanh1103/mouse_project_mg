import { Product } from '../models/index.js';
import responseHelper from "../helpers/responseHelper.js";

// render view
export const productPage = async (req, res) => {
  res.render('product/index', {
  title: 'Product List',
  page: 'product'
  });
}

// GET all products
export const getProducts = async (req, res) => {
  try {
      const products = await Product.find({})
        .populate('material brand front_flare side_curvature sensor')
        .lean();
      responseHelper.success(res, products);
  } catch (error) {
      responseHelper.error(res, error.message)
  }
};

// POST a new product
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();

    const saved = await Product.findById(newProduct._id)
    .populate('material brand front_flare side_curvature sensor')
    .lean();

  responseHelper.success(res, saved, 'Added');
  } catch (error) {
    responseHelper.error(res, error.message);
  }
}

// PUT to update an existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Product.findById(id).lean();
    if (!existing) return responseHelper.error(res, 'Not found', 404);

    const nameToCheck  = req.body.name  ?? existing.name;
    const brandToCheck = req.body.brand ?? existing.brand;

    const duplicate = await Product.findOne({
      name: nameToCheck,
      brand: brandToCheck,
      _id: { $ne: id }
    })

    if (duplicate) {
      return responseHelper.error(res, `Product with name "${nameToCheck}" for that brand already exists.`, 400);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
      .populate('material brand front_flare side_curvature sensor')
      .lean();
    responseHelper.success(res, updatedProduct, 'Updated');
  } catch (error) {
    responseHelper.error(res, error.message);
  }
}

// DELETE products
export const delProducts = async (req, res) => {
  try {
      const { productIds } = req.body;
      const result = await Product.deleteMany({
          _id: { $in: productIds }
      });

      responseHelper.success(res, `DelCounts: ${result.deletedCount}` ,'Deleted');
  } catch (error) {
      responseHelper.error(res, error.message);
  }
};