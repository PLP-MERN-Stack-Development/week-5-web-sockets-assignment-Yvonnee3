"use client"

import { useState } from "react"
import { useSocket } from "../context/SocketContext"
import { useAuth } from "../context/AuthContext"

const UserList = () => {
  const [showPrivateChat, setShowPrivateChat] = useState(null)
  const [privateMessage, setPrivateMessage] = useState("")
  const { onlineUsers, sendPrivateMessage } = useSocket()
  const { user } = useAuth()

  const handlePrivateMessage = (recipientId) => {
    if (privateMessage.trim()) {
      sendPrivateMessage(privateMessage, recipientId)
      setPrivateMessage("")
      setShowPrivateChat(null)
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Online Users ({onlineUsers.length})</h3>

      <div className="space-y-2">
        {onlineUsers.map((onlineUser) => {
          if (onlineUser.userId === user?.id) return null

          return (
            <div key={onlineUser.socketId} className="relative">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      {onlineUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{onlineUser.username}</span>
                </div>

                <button
                  onClick={() => setShowPrivateChat(showPrivateChat === onlineUser.userId ? null : onlineUser.userId)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  💬
                </button>
              </div>

              {showPrivateChat === onlineUser.userId && (
                <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={privateMessage}
                      onChange={(e) => setPrivateMessage(e.target.value)}
                      placeholder="Private message..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handlePrivateMessage(onlineUser.userId)
                        }
                      }}
                    />
                    <button
                      onClick={() => handlePrivateMessage(onlineUser.userId)}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {onlineUsers.length === 1 && (
        <div className="text-center text-gray-500 text-sm mt-4">You're the only one online</div>
      )}
    </div>
  )
}

export default UserList
