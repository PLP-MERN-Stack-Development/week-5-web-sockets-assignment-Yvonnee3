const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

// --- ADDED/MODIFIED IMPORTS/DEFINITIONS FOR MISSING FUNCTIONS/SERVICES ---

// Placeholder for validation functions.
// If you have a dedicated validation utility file (e.g., '../utils/validation'),
// you should import them from there like:
// const { validateMessage, validateReaction } = require('../utils/validation');
const validateMessage = (data) => {
  // Implement your message validation logic here
  // For now, a basic check:
  if (!data.content || data.content.trim().length === 0) {
    return { isValid: false, message: 'Message content cannot be empty' };
  }
  if (!data.roomId) {
    return { isValid: false, message: 'Message must belong to a room' };
  }
  return { isValid: true };
};

const validateReaction = (data) => {
  // Implement your reaction validation logic here
  // For now, a basic check:
  if (!data.messageId || !data.reaction) {
    return { isValid: false, message: 'Message ID and reaction type are required' };
  }
  // You might want to validate reaction type (e.g., 'like', 'heart', etc.)
  return { isValid: true };
};

// Placeholder for notification service.
// If you have a dedicated notification service file, import it like:
// const notificationService = require('../services/notificationService');
const notificationService = {
  sendPushNotification: async (userId, title, body) => {
    console.log(`Sending push notification to user ${userId}: ${title} - ${body}`);
    // Implement actual push notification logic here (e.g., using a push notification library)
    return Promise.resolve({ success: true, message: 'Notification sent (placeholder)' });
  }
};

// Placeholder for file upload function.
// If you have a dedicated file upload utility, import it like:
// const { uploadFile } = require('../utils/fileUpload');
const uploadFile = async (fileData, fileName, fileType) => {
  console.log(`Uploading file: ${fileName} (${fileType}, ${fileData.length} bytes)`);
  // Implement actual file upload logic here (e.g., saving to disk, S3, etc.)
  // For now, return a dummy URL
  return Promise.resolve(`/uploads/${fileName}`);
};

// --- END ADDED/MODIFIED IMPORTS/DEFINITIONS ---


// Online users tracking
const onlineUsers = new Map();
const userSockets = new Map();

const socketController = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Authentication
    socket.on('authenticate', async (token) => {
      try {
        // Ensure JWT_SECRET is defined in your .env file
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          socket.emit('authentication_error', { message: 'User not found' });
          return;
        }

        // Store user info in socket
        socket.userId = user._id.toString();
        socket.user = user;

        // Update user status
        await User.findByIdAndUpdate(user._id, {
          status: 'online',
          lastSeen: new Date()
        });

        // Add to online users tracking
        onlineUsers.set(user._id.toString(), {
          socketId: socket.id,
          username: user.username,
          avatar: user.avatar,
          status: 'online'
        });

        userSockets.set(socket.id, user._id.toString());

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

      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_error', { message: 'Invalid token' });
      }
    });

    // Join room
    socket.on('join_room', async (roomId) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is member of private room
        if (room.isPrivate && !room.members.includes(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Leave current room
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
        }

        // Join new room
        socket.join(roomId);
        socket.currentRoom = roomId;

        // Get recent messages with pagination
        const messages = await Message.find({ room: roomId })
          .populate('sender', 'username avatar')
          .populate('reactions.user', 'username')
          .sort({ createdAt: -1 })
          .limit(50);

        socket.emit('room_messages', messages.reverse());

        // Add user to room members if not already
        if (!room.members.includes(socket.userId)) {
          room.members.push(socket.userId);
          await room.save();
        }

        // Notify others in room
        socket.to(roomId).emit('user_joined_room', {
          userId: socket.userId,
          username: socket.user.username,
          roomId
        });

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const validation = validateMessage(data); // <--- NOW DEFINED
        if (!validation.isValid) {
          socket.emit('error', { message: validation.message });
          return;
        }

        const { content, roomId, messageType = 'text' } = data;

        // Create message
        const message = new Message({
          content,
          sender: socket.userId,
          room: roomId,
          messageType
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Update room's last activity
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          lastActivity: new Date()
        });

        // Emit to room
        io.to(roomId).emit('new_message', message);

        // Send notifications to offline users
        const room = await Room.findById(roomId).populate('members', 'username status');
        const offlineMembers = room.members.filter(member =>
          member._id.toString() !== socket.userId &&
          member.status === 'offline'
        );

        // Send push notifications
        for (const member of offlineMembers) {
          await notificationService.sendPushNotification( // <--- NOW DEFINED
            member._id,
            `New message from ${socket.user.username}`,
            content
          );
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      if (!socket.userId || !data.roomId) return;

      socket.to(data.roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        roomId: data.roomId
      });
    });

    socket.on('typing_stop', (data) => {
      if (!socket.userId || !data.roomId) return;

      socket.to(data.roomId).emit('user_stop_typing', {
        userId: socket.userId,
        roomId: data.roomId
      });
    });

    // Private messaging
    socket.on('send_private_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { content, recipientId } = data;

        if (!content || !recipientId) {
          socket.emit('error', { message: 'Content and recipient required' });
          return;
        }

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

        // Send notification if recipient is offline
        const recipient = await User.findById(recipientId);
        if (recipient && recipient.status === 'offline') { // Added check for recipient existence
          await notificationService.sendPushNotification( // <--- NOW DEFINED
            recipientId,
            `Private message from ${socket.user.username}`,
            content
          );
        }

      } catch (error) {
        console.error('Private message error:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    // Message reactions
    socket.on('add_reaction', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const validation = validateReaction(data); // <--- NOW DEFINED
        if (!validation.isValid) {
          socket.emit('error', { message: validation.message });
          return;
        }

        const { messageId, reaction } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

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

        // Emit to room (or recipient if private message)
        if (message.room) {
          io.to(message.room).emit('message_reaction', {
            messageId,
            reactions: message.reactions
          });
        } else if (message.recipient) { // Assuming private messages might also have reactions
             // You might need a more sophisticated way to emit private message reactions
             // e.g., to both sender and recipient's private rooms
             io.to(socket.userId).emit('message_reaction', { messageId, reactions: message.reactions });
             io.to(message.recipient.toString()).emit('message_reaction', { messageId, reactions: message.reactions });
        }


      } catch (error) {
        console.error('Reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // File upload
    socket.on('upload_file', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { fileData, fileName, fileType, roomId } = data;

        // Upload file
        const fileUrl = await uploadFile(fileData, fileName, fileType); // <--- NOW DEFINED

        const message = new Message({
          content: fileName,
          sender: socket.userId,
          room: roomId,
          messageType: 'file',
          fileData: {
            fileName,
            fileType,
            fileSize: fileData.length, // Assuming fileData is a buffer/string with a length property
            fileUrl
          }
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        io.to(roomId).emit('new_message', message);

      } catch (error) {
        console.error('File upload error:', error);
        socket.emit('error', { message: 'Failed to upload file' });
      }
    });

    // Read receipts
    socket.on('mark_as_read', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { messageId } = data;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: socket.userId }
        });

        // Optionally, emit to the sender or room that the message was read
        socket.emit('message_read', { messageId, readerId: socket.userId });

      } catch (error) {
        console.error('Mark as read error:', error);
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.userId) {
        // Update user status to offline
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: new Date()
        });

        // Remove from online users
        onlineUsers.delete(socket.userId);
        userSockets.delete(socket.id);

        // Notify others
        socket.broadcast.emit('user_offline', { userId: socket.userId });

        // Send updated online users list
        const onlineUsersList = Array.from(onlineUsers.values());
        io.emit('online_users', onlineUsersList);
      }
    });

    // Error handling for socket
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketController;