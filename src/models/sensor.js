import mongoose from "mongoose";

const sensor = new mongoose.Schema({
    name: {type: String, default: ''}
},
{
    collection: 'Sensors',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const Sensor = mongoose.model('Sensor', sensor);
export default Sensor;