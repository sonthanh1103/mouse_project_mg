import { Sensor } from "../models/index.js";
import responseHelper from '../helpers/responseHelper.js';

export const sensorPage = (req, res) => {
    res.render('product/sensor', {
        title: 'Sensor',
        page: 'sensor'
    })
}

export const getSensors = async (req, res) => {
    try {
        const { s } = req.query;
        const filter = {};
        if (s) {
            filter["$or"] = [
                { name: { $regex: s, $options: 'i' }},
                { description: { $regex: s, $options: 'i' }}
            ]
        }
        const sensors = await Sensor.find(filter);
        responseHelper.success(res, sensors)
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const createSensor = async (req, res) => {
    try {
        const sensor = new Sensor({});
        await sensor.save();
        responseHelper.success(res, sensor, 'Added');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const updateSensor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const existing = await Sensor.findOne({
            name,
            _id: { $ne: id }
        });
        if (existing) {
            return responseHelper.error(res, `${name} already exists.`);
        }

        const updateSensor = await Sensor.findByIdAndUpdate(id, { name, description }, { new: true });
        responseHelper.success(res, updateSensor, 'Updated')
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}

export const deleteSensors = async (req, res) => {
    try {
        const { sensorIds } = req.body;
        const result = await Sensor.deleteMany({
            _id: { $in: sensorIds }
        })
        responseHelper.success(res, result.deletedCount, 'Deleted');
    } catch (error) {
        responseHelper.error(res, error.message);
    }
}