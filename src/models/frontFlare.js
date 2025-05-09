import mongoose from "mongoose";

const frontFlareSchema = new mongoose.Schema({
    name: {type: String, default: ''}
},
{
    collection: 'FrontFlares',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const FrontFlare = mongoose.model('FrontFlare', frontFlareSchema);
export default FrontFlare;