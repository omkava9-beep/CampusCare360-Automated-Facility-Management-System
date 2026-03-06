const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportTitle: { type: String, required: true }, // e.g., "Weekly Report - Week 42"
  reportType: { type: String, enum: ['Weekly', 'Monthly', 'Custom'], default: 'Weekly' },
  
  stats: {
    totalGrievances: { type: Number },
    solvedCases: { type: Number },
    efficiencyGrowth: { type: String } // e.g., "+12%"
  },
  
  fileUrl: { type: String }, // URL to the stored PDF
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);