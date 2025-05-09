import mongoose from "mongoose";

const sideCurvatureSchema = new mongoose.Schema({
    name: { type: String, default: ''}
},
{
    collection: 'SideCurvatures',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const SideCurvature = mongoose.model('SideCurvature', sideCurvatureSchema);
export default SideCurvature;