import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
    name: {type: String , default: ''}
},
{
    collection: 'Materials',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const Material = mongoose.model('Material', materialSchema);
export default Material;