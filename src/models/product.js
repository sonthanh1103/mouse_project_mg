import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const productSchema = new mongoose.Schema({
  // material: { type: ObjectId, default: null, ref: "Material" },
  brand: { type: ObjectId, default: null, ref: "Brand" },
  name: { type: String, default: '' },
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  shape: { type: String, default: '' },
  hump_placement: { type: String, default: '' },
  front_flare: { type: String, default: '' },
  side_curvature: { type: String, default: '' },
  hand_compatibility: { type: String, default: '' },
  thumb_rest: {type: Boolean, default: true},
  ring_finger_rest: {type: Boolean, default: true},
  material: { type: String, default: '' },
  connectivity: { type: String, default: '' },
  sensor: { type: String, default: '' },
  sensor_technology: { type: String, default: '' },
  sensor_position: { type: String, default: '' },
  dpi: { type: Number, default: 0 },
  polling_rate: { type: Number, default: 0 },
  tracking_speed: { type: Number, default: 0 },
  acceleration: { type: Number, default: 0 },
  side_buttons: { type: Number, default: 0 },
  middle_buttons: { type: Number, default: 0 },
});

const Product = mongoose.model('Product', productSchema);
export default Product;