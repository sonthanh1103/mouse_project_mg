import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "Material" },
  brand: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "Brand" },
  front_flare: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'FrontFlare' },
  side_curvature: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'SideCurvature' },
  sensor: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Sensor' },
  name: { type: String, default: '' },
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  shape: { type: String, enum: ['Symmetrical', 'Ergonomic', 'Hybrid'], default: 'Symmetrical' },
  hump_placement: { type: String, enum: ['Center', 'Back - minimal', 'Back - moderate', 'Back - aggressive'], default: 'Center' },
  hand_compatibility: { type: String, enum: ['Right', 'Left', 'Ambidextrous'], default: 'Right' },
  thumb_rest: {type: Boolean, default: true},
  ring_finger_rest: {type: Boolean, default: true},
  connectivity: { type: String, enum: ['Wireless', 'Wired'], default: 'Wireless' },
  sensor_technology: { type: String, enum: ['Optical', 'Laser'], default: 'Optical' },
  sensor_position: { type: String, default: '' },
  dpi: { type: Number, default: 0 },
  polling_rate: { type: Number, default: 0 },
  tracking_speed: { type: Number, default: 0 },
  acceleration: { type: Number, default: 0 },
  side_buttons: { type: Number, default: 0 },
  middle_buttons: { type: Number, default: 0 },
},
{
  collection: "Products", 
  timestamps: { createdAt: 'createdAt', updatedAt : 'updatedAt'}
}
);

const Product = mongoose.model('Product', productSchema);
export default Product;