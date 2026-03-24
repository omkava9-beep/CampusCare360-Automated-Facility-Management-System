const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['assignment', 'approval', 'system', 'reassigned'], 
        default: 'system' 
    },
    relatedTicketID: { 
        type: String 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

// Index for getting notifications quickly by recipient
NotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
