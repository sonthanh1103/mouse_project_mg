import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
 {
   name: {type: String, default: ''},
   description: {type: String, default: ''}
 },
 {
    collection: 'Brands',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
 }
)

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;