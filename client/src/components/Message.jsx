"use client"

import { useState } from "react"
import { useSocket } from "../context/SocketContext"

const Message = ({ message, isOwn, currentUser }) => {
  const [showReactions, setShowReactions] = useState(false)
  const { addReaction } = useSocket()

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReaction = (reactionType) => {
    addReaction(message._id, reactionType)
    setShowReactions(false)
  }

  const reactions = ["like", "love", "laugh", "angry", "sad"]
  const reactionEmojis = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    angry: "😠",
    sad: "😢",
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {!isOwn && <div className="text-xs font-semibold mb-1 text-gray-600">{message.sender.username}</div>}

        <div className="break-words">
          {message.messageType === "file" ? (
            <div className="flex items-center space-x-2">
              <span>📎</span>
              <span>{message.content}</span>
            </div>
          ) : (
            message.content
          )}
        </div>

        <div className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
          {formatTime(message.createdAt)}
          {message.edited && <span className="ml-1">(edited)</span>}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex space-x-1 mt-2">
            {Object.entries(
              message.reactions.reduce((acc, reaction) => {
                acc[reaction.type] = (acc[reaction.type] || 0) + 1
                return acc
              }, {}),
            ).map(([type, count]) => (
              <span key={type} className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1">
                {reactionEmojis[type]} {count}
              </span>
            ))}
          </div>
        )}

        {/* Reaction Button */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-600 text-white rounded-full w-6 h-6 text-xs"
        >
          😊
        </button>

        {/* Reaction Picker */}
        {showReactions && (
          <div className="absolute top-0 right-0 transform translate-x-full bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
            {reactions.map((reaction) => (
              <button key={reaction} onClick={() => handleReaction(reaction)} className="hover:bg-gray-100 p-1 rounded">
                {reactionEmojis[reaction]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message
