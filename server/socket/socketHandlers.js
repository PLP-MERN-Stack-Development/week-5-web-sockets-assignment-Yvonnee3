const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const socketHandlers = (io, socket, onlineUsers) => {
  
  // User authentication
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        socket.userId = user._id.toString();
        socket.user = user;
        
        // Add to online users
        onlineUsers.set(user._id.toString(), {
          socketId: socket.id,
          username: user.username,
          avatar: user.avatar,
          status: 'online'
        });
        
        // Join user's private room
        socket.join(user._id.toString());
        
        // Emit user online status
        socket.broadcast.emit('user_online', {
          userId: user._id,
          username: user.username,
          avatar: user.avatar
        });
        
        // Send online users list
        const onlineUsersList = Array.from(onlineUsers.values());
        io.emit('online_users', onlineUsersList);
        
        socket.emit('authenticated', { user });
      }
    } catch (error) {
      socket.emit('authentication_error', { message: 'Invalid token' });
    }
  });
  
  // Join room
  socket.on('join_room', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (room) {
        socket.join(roomId);
        socket.currentRoom = roomId;
        
        // Get recent messages
        const messages = await Message.find({ room: roomId })
          .populate('sender', 'username avatar')
          .sort({ createdAt: -1 })
          .limit(50);
        
        socket.emit('room_messages', messages.reverse());
        
        // Notify others in room
        socket.to(roomId).emit('user_joined_room', {
          userId: socket.userId,
          username: socket.user.username,
          roomId
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { content, roomId, messageType = 'text' } = data;
      
      const message = new Message({
        content,
        sender: socket.userId,
        room: roomId,
        messageType
      });
      
      await message.save();
      await message.populate('sender', 'username avatar');
      
      // Emit to room
      io.to(roomId).emit('new_message', message);
      
      // Send notification to offline users
      const room = await Room.findById(roomId).populate('members', 'username');
      const offlineMembers = room.members.filter(member => 
        !onlineUsers.has(member._id.toString())
      );
      
      // Here you would implement push notifications for offline users
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Typing indicator
  socket.on('typing_start', (data) => {
    socket.to(data.roomId).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      roomId: data.roomId
    });
  });
  
  socket.on('typing_stop', (data) => {
    socket.to(data.roomId).emit('user_stop_typing', {
      userId: socket.userId,
      roomId: data.roomId
    });
  });
  
  // Private messaging
  socket.on('send_private_message', async (data) => {
    try {
      const { content, recipientId } = data;
      
      const message = new Message({
        content,
        sender: socket.userId,
        recipient: recipientId,
        messageType: 'private'
      });
      
      await message.save();
      await message.populate('sender', 'username avatar');
      
      // Send to recipient
      socket.to(recipientId).emit('private_message', message);
      
      // Confirm to sender
      socket.emit('private_message_sent', message);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });
  
  // Message reactions
  socket.on('add_reaction', async (data) => {
    try {
      const { messageId, reaction } = data;
      
      const message = await Message.findById(messageId);
      if (message) {
        const existingReaction = message.reactions.find(r => 
          r.user.toString() === socket.userId && r.type === reaction
        );
        
        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions.filter(r => 
            !(r.user.toString() === socket.userId && r.type === reaction)
          );
        } else {
          // Add reaction
          message.reactions.push({
            user: socket.userId,
            type: reaction
          });
        }
        
        await message.save();
        
        // Emit to room
        if (message.room) {
          io.to(message.room).emit('message_reaction', {
            messageId,
            reactions: message.reactions
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });
  
  // Read receipts
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageId } = data;
      
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: socket.userId }
      });
      
      socket.emit('message_read', { messageId });
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark as read' });
    }
  });
  
  // File upload
  socket.on('upload_file', async (data) => {
    try {
      const { fileData, fileName, fileType, roomId } = data;
      
      // Here you would implement file upload logic
      // For now, we'll just create a message with file info
      
      const message = new Message({
        content: fileName,
        sender: socket.userId,
        room: roomId,
        messageType: 'file',
        fileData: {
          fileName,
          fileType,
          fileSize: fileData.length
        }
      });
      
      await message.save();
      await message.populate('sender', 'username avatar');
      
      io.to(roomId).emit('new_message', message);
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to upload file' });
    }
  });
};

module.exports = socketHandlers;