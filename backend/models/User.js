const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fName :{
    type: String,
    required: true
  },
  midName :{
    type: String
  },
  lastName :{
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
    password: { 
        type: String, 
        required: true 
    },
  role: { 
    type: String, 
    enum: ['student', 'contractor', 'admin', 'faculty'], 
    required: true 
  },

  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Suspended'], 
    default: 'Active' 
  },
  department: { type: String },
  phoneNumber: { type: String },
  profilePic: { type: String },
  
  socketId: { type: String, default: null },
  myGrievances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grievance' }], // For students
  assignedGrievances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grievance' }], // For contractors
  // Contractor Specific Fields
  contractorDetails: {
    specialization: { type: String }, // e.g., "Plumbing", "Electrical"
    rating: { type: Number, default: 0 },
    memberSince: { type: Date, default: Date.now },
    currentFloor: { type: Number },
    // Geospatial Index for Nearest Contractor Logic
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);