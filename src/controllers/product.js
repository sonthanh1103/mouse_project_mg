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
        .populate('material')
        .populate('front_flare')
        .populate('side_curvature')
        .populate('sensor')
        .populate('brand')
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
    .populate('material', 'name')
    .populate('front_flare')
    .populate('side_curvature')
    .populate('sensor')
    .populate('brand')
    .lean();

  responseHelper.success(res, saved, 'Added');
  } catch (error) {
    responseHelper.error(res, error.message);
  }
}

// PUT to update an existing product
export const updateProduct = async (req, res) => {
  try {
    // const { id } = req.params;
    // const { name } = req.body;
    // const nameExist = await Product.findOne({
    //   name,
    //   _id: { $ne: id }
    // })

    // if (nameExist) {
    //   return responseHelper.error(res, `Product ${name} already exist.`, 400);
    // }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('material')
      .populate('front_flare')
      .populate('side_curvature')
      .populate('sensor')
      .populate('brand');
    responseHelper.success(res, updatedProduct, 'Updated');
  } catch (error) {
    responseHelper.error(res, error.message);
  }
}

// DELETE products
export const delProducts = async (req, res) => {
  try {
      const { productIds } = req.body;
      if (!productIds || productIds.length === 0) {
        return responseHelper.error(res, 'Please choose at least one product', 400);
      }
      const result = await Product.deleteMany({
          _id: { $in: productIds }
      });

      if (result.deletedCount === 0) {
        return responseHelper.error(res, 'Product Not Found', 404);
      }
      responseHelper.success(res, `DelCounts: ${result.deletedCount}` ,'Deleted');
  } catch (error) {
      responseHelper.error(res, error.message);
  }
};