"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"

const ChatSidebar = ({ rooms, selectedRoom, onRoomSelect, user }) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const { logout } = useAuth()
  const { onlineUsers } = useSocket()

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim()) {
      // In a real app, you'd call an API to create the room
      console.log("Creating room:", newRoomName)
      setNewRoomName("")
      setShowCreateRoom(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">ROOMS</h3>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="text-gray-400 hover:text-white text-xl"
            >
              +
            </button>
          </div>

          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="mb-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name..."
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </form>
          )}

          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => onRoomSelect(room._id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedRoom === room._id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                # {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">ONLINE USERS ({onlineUsers.length})</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.socketId} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-300">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar;
