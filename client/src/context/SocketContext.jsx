import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user, token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: { token }
      });

      // Authentication
      newSocket.emit('authenticate', token);

      // Socket event listeners
      newSocket.on('authenticated', (data) => {
        console.log('Authenticated:', data.user);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_online', (userData) => {
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
        showNotification(`${userData.username} is now online`, 'info');
      });

      newSocket.on('user_offline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        
        // Show notification if not in current room
        if (message.room !== currentRoom) {
          showNotification(`New message from ${message.sender.username}`, 'message');
        }
      });

      newSocket.on('room_messages', (roomMessages) => {
        setMessages(roomMessages);
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      });

      newSocket.on('user_stop_typing', (data) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      newSocket.on('private_message', (message) => {
        setMessages(prev => [...prev, message]);
        showNotification(`Private message from ${message.sender.username}`, 'message');
      });

      newSocket.on('message_reaction', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ));
      });

      newSocket.on('error', (error) => {
        showNotification(error.message, 'error');
      });

      // Reconnection handling
      newSocket.on('reconnect', () => {
        showNotification('Reconnected to server', 'success');
        if (currentRoom) {
          newSocket.emit('join_room', currentRoom);
        }
      });

      newSocket.on('disconnect', () => {
        showNotification('Disconnected from server', 'warning');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, currentRoom, showNotification]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
      setCurrentRoom(roomId);
    }
  };

  const sendMessage = (content, roomId) => {
    if (socket && content.trim()) {
      socket.emit('send_message', {
        content: content.trim(),
        roomId,
        messageType: 'text'
      });
    }
  };

  const sendPrivateMessage = (content, recipientId) => {
    if (socket && content.trim()) {
      socket.emit('send_private_message', {
        content: content.trim(),
        recipientId
      });
    }
  };

  const startTyping = (roomId) => {
    if (socket) {
      socket.emit('typing_start', { roomId });
    }
  };

  const stopTyping = (roomId) => {
    if (socket) {
      socket.emit('typing_stop', { roomId });
    }
  };

  const addReaction = (messageId, reaction) => {
    if (socket) {
      socket.emit('add_reaction', { messageId, reaction });
    }
  };

  const uploadFile = (fileData, fileName, fileType, roomId) => {
    if (socket) {
      socket.emit('upload_file', {
        fileData,
        fileName,
        fileType,
        roomId
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    currentRoom,
    messages,
    typingUsers,
    joinRoom,
    sendMessage,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    addReaction,
    uploadFile
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};