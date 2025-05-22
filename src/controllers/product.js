import { Product } from '../models/index.js';
import responseHelper from "../helpers/responseHelper.js";
import mongoose from 'mongoose';

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
        .lean()
        .sort({ createdAt: -1 });
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
    if (!existing) return responseHelper.error(res, 'Product Not found', 404);

    const nameToCheck = req.body.name ?? existing.name;
    const brandToCheck = req.body.brand ?? existing.brand;

    const numFields = ['length','width','height','weight','dpi','polling_rate','tracking_speed','acceleration','side_buttons','middle_buttons'];
    for (const field of numFields) {
      if (field in req.body) {
        const value = Number(req.body[field]);
        if (isNaN(value) || value < 0) {
          return responseHelper.error(res, `${field} must be a non-negative number`, 400);
        }
        req.body[field] = value;
      }
    }

    const duplicate = await Product.findOne({
      name: nameToCheck,
      brand: brandToCheck,
      _id: { $ne: id }
    });

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

    const validIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== productIds.length) {
        return responseHelper.error(res, 'Invalid product IDs provided.', 400);
    }

    const result = await Product.deleteMany({
      _id: { $in: validIds }
    });

    responseHelper.success(res, `Deleted ${result.deletedCount} product${result.deletedCount > 1 ? 's':''}.`, 'Deleted');
  } catch (error) {
    responseHelper.error(res, error.message);
  }
};

// POST /api/product/compare — Compare endpoint
export const compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length < 1) {
      return responseHelper.error(res, 'Provide at least one product ID', 400);
    }

    // Validate each as ObjectId
    const validIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== productIds.length) {
      return responseHelper.error(res, 'Invalid product IDs provided', 400);
    }

    // Fetch products along with references
    const products = await Product.find({ _id: { $in: validIds } })
      .populate('brand material front_flare side_curvature sensor')
      .lean();

    if (products.length === 0) {
      return responseHelper.error(res, 'No products found', 404);
    }

    return responseHelper.success(res, products);
  } catch (err) {
    return responseHelper.error(res, err.message);
  }
};

export const searchProducts = async (req, res) => {
  try {
  const q = req.query.q || '';
  if (!q) return res.json([]);
  const regex = new RegExp(q, 'i');
  const products = await Product.aggregate([
    {
      $lookup: {
        from: 'brands',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand'
      }
    },
    { $unwind: '$brand' },
    {
      $match: {
        $or: [
          { name: { $regex: regex } },
          { 'brand.name': { $regex: regex } }
        ]
      }
    },
    { $limit: 20 }
  ]);
    responseHelper.success(res, products);
  } catch (err) {
    responseHelper.error(res, err.message);
  }
};

export const getSuggestedProducts = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 9;
  const products = await Product.find({})
    .populate('material brand front_flare side_curvature sensor')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  responseHelper.success(res, products);
};