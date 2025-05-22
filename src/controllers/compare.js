// routes/product.js (hoặc controller)
import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = parseInt(req.query.limit, 10) || 10;
  if (!q) return res.json({ success: true, data: [] });

  const regex = new RegExp(q, 'i');
  try {
    const products = await Product.aggregate([
      // 1) lookup brand
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      // 2) match trên name hoặc brand.name
      {
        $match: {
          $or: [
            { name: regex },
            { 'brand.name': regex }
          ]
        }
      },
      // 3) lấy limit bản ghi
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          'brand._id': 1,
          'brand.name': 1
        }
      }
    ]);

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
