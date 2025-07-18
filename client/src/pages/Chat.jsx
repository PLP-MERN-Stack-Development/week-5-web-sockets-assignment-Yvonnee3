import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import UserList from '../components/UserList';


const Chat = () => {
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [rooms, setRooms] = useState([
    { _id: 'general', name: 'General', members: [] },
    { _id: 'random', name: 'Random', members: [] }
  ]);
  const { joinRoom, currentRoom } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (selectedRoom) {
      joinRoom(selectedRoom);
    }
  }, [selectedRoom, joinRoom]);

  return (
    <div className="chat-container">
      <ChatSidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        onRoomSelect={setSelectedRoom}
        user={user}
      />
      <ChatWindow
        currentRoom={currentRoom}
        selectedRoom={selectedRoom}
      />
      <UserList />
    </div>
  );
};

export default Chat;