const Message = require('../models/Message');
const { getIO } = require('../utils/socket');

exports.sendMessage = async (req, res) => {
    try {
        const { grievanceId, text } = req.body;
        const sender = req.user._id;

        const message = new Message({
            grievanceId,
            sender,
            text
        });

        await message.save();
        await message.populate('sender', 'fName lastName role profilePic');

        // Emit to the ticket room (or relevant users)
        const io = getIO();
        io.to(grievanceId).emit('newMessage', message);

        res.status(201).json({ message: 'Message sent', data: message });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const messages = await Message.find({ grievanceId })
            .populate('sender', 'fName lastName role profilePic')
            .sort({ createdAt: 1 });

        res.status(200).json({ data: messages });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};
