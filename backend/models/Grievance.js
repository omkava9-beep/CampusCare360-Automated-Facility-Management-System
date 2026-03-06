const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  ticketID: { type: String, unique: true, required: true }, // e.g., #GR-2024-001
  submittedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String}, // Should match contractor specialization
  
  criticality: { type: String, enum: ['Normal', 'Critical', 'Emergency'], default: 'Normal' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['applied', 'in-progress', 'done', 'resolved'], default: 'applied' },

  // Relationships
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedContractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Proximity Logic Metadata
  assignmentMeta: {
    distanceInMeters: { type: Number },
    isFloorMatched: { type: Boolean, default: false }
  },

  // Media & Completion
  initialPhoto: { type: String }, // Student upload
  resolvedPhoto: { type: String }, // Contractor upload (Before/After)
  contractorNotes: { type: String },
  adminFeedback: { type: String },
  
  // Checklists (As seen in UI)
  completionChecklist: {
    isAreaClean: { type: Boolean, default: false },
    isTested: { type: Boolean, default: false }
  },

  dueAt: { type: Date },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', GrievanceSchema);