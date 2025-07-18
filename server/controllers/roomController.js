const Room = require('../models/Room');
const Message = require('../models/Message');

const roomController = {
  // Get all rooms for user
  getRooms: async (req, res) => {
    try {
      const rooms = await Room.find({
        $or: [
          { isPrivate: false },
          { members: req.user.id }
        ]
      })
        .populate('members', 'username avatar')
        .populate('lastMessage')
        .sort({ lastActivity: -1 });

      res.json({ rooms });

    } catch (error) {
      console.error('Get rooms error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new room
  createRoom: async (req, res) => {
    try {
      const { name, description, isPrivate = false } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Room name is required' });
      }

      const room = new Room({
        name,
        description,
        creator: req.user.id,
        members: [req.user.id],
        isPrivate
      });

      await room.save();
      await room.populate('members', 'username avatar');

      res.status(201).json({
        message: 'Room created successfully',
        room
      });

    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Join room
  joinRoom: async (req, res) => {
    try {
      const { roomId } = req.params;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      if (room.members.includes(req.user.id)) {
        return res.status(400).json({ message: 'Already a member' });
      }

      room.members.push(req.user.id);
      await room.save();

      res.json({ message: 'Joined room successfully' });

    } catch (error) {
      console.error('Join room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Leave room
  leaveRoom: async (req, res) => {
    try {
      const { roomId } = req.params;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      room.members = room.members.filter(
        member => member.toString() !== req.user.id
      );
      await room.save();

      res.json({ message: 'Left room successfully' });

    } catch (error) {
      console.error('Leave room error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get room details
  getRoomDetails: async (req, res) => {
    try {
      const { roomId } = req.params;

      const room = await Room.findById(roomId)
        .populate('members', 'username avatar status')
        .populate('creator', 'username avatar');

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Check access
      if (room.isPrivate && !room.members.find(m => m._id.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ room });

    } catch (error) {
      console.error('Get room details error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

}; // End of roomController object

// *** ADD THIS LINE ***
module.exports = roomController;