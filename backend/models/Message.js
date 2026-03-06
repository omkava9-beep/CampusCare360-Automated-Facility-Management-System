const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  grievanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // To differentiate UI alignment (AD vs ME)
  senderType: { type: String, enum: ['AD', 'ME', 'SYS'], required: true }, 
  
  text: { type: String, required: true },
  isSystemGenerated: { type: Boolean, default: false }, // For status change logs
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);