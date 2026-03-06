const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  locationName: { type: String, required: true }, // e.g., "Lab 302"
  buildingBlock: { type: String, required: true }, // e.g., "Science Block A"
  floorNumber: { type: Number, required: true },
  isHighPriorityZone: { type: Boolean, default: false },
  
  // Fixed coordinates of the QR code
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  
  qrCodeUrl: { type: String }, // URL to the downloadable PDF/Image
  
  zoneMetadata: {
    operatingHours: { type: String },
    availableFacilities: [String],
    networkName: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);