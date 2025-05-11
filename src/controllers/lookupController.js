import Brand from '../models/brand.js';
import Material from '../models/material.js';
import FrontFlare from '../models/frontFlare.js';
import SideCurvature from '../models/sideCurvature.js';
import Sensor from '../models/sensor.js';
import responseHelper from '../helpers/responseHelper.js';

export const getProductLookUp = async (req, res) => {
  try {
    const [brands, materials, frontFlares, sideCurvatures, sensors] = await Promise.all([
      Brand.find({}, '_id name'),
      Material.find({}, '_id name'),
      FrontFlare.find({}, '_id name'),
      SideCurvature.find({}, '_id name'),
      Sensor.find({}, '_id name')
    ]);

    responseHelper.success(res,  {
        brand: brands,
        material: materials,
        front_flare: frontFlares,
        side_curvature: sideCurvatures,
        sensor: sensors
      });
  } catch (error) {
    responseHelper.error(res, error.message)
  }
};
