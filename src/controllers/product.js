import Product from '../models/product.js';
import responseHelper from "../helpers/responseHelper.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
      const product = await Product.find({});
      if (!product) {
        responseHelper.error(res, 'Cannot load product', 400);
      }
      responseHelper.success(res, product);
  } catch (error) {
      responseHelper.error(res, error.message)
  }
};

// POST a new product
export const createProduct = async (req, res) => {
  const newProduct = new Product({});
  try {
    await newProduct.save();
    res.status(201).json({ newProduct, message: 'Added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// PUT to update an existing product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// DELETE a product
export const deleteProduct = async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id); 
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// DELETE products
export const delProducts = async (req, res) => {
  try {
      const { productIds } = req.body;
      if (!productIds || productIds.length === 0) {
        return res.status(404).json({ message: 'Please choose at least one product.'})
      }
      const result = await Product.deleteMany({
          _id: { $in: productIds }
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({message: 'Product Not Found.'})
      }
      res.json({ message: 'Deleted'})
  } catch (error) {
      res.status(500).json({message: error.message});
  }
};