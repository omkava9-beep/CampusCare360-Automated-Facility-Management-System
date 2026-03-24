const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    grievanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    attachments: [{ type: String }], // Optional photos
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);