const Message = require('../models/Message');
const Room = require('../models/Room');

const messageController = {
  // Get messages for a room with pagination
  getMessages: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Check if user is member of room
      if (room.isPrivate && !room.members.includes(req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({ room: roomId })
        .populate('sender', 'username avatar')
        .populate('reactions.user', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const totalMessages = await Message.countDocuments({ room: roomId });
      
      res.json({
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages
        }
      });
      
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Get private messages between two users
  getPrivateMessages: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({
        $or: [
          { sender: req.user.id, recipient: userId },
          { sender: userId, recipient: req.user.id }
        ],
        messageType: 'private'
      })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      res.json({
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          hasNext: messages.length === parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Get private messages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Search messages
  searchMessages: async (req, res) => {
    try {
      const { query, roomId } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query required' });
      }
      
      const searchFilter = {
        content: { $regex: query, $options: 'i' }
      };
      
      if (roomId) {
        searchFilter.room = roomId;
      }
      
      const messages = await Message.find(searchFilter)
        .populate('sender', 'username avatar')
        .populate('room', 'name')
        .sort({ createdAt: -1 })
        .limit(100);
      
      res.json({ messages });
      
    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await Message.findByIdAndDelete(messageId);
      
      res.json({ message: 'Message deleted successfully' });
      
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Edit message
  editMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      message.content = content;
      message.edited = true;
      message.editedAt = new Date();
      
      await message.save();
      
      res.json({ message: 'Message updated successfully', data: message });
      
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = messageController;