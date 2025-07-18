"use client"

import { useState, useRef, useEffect } from "react"
import { useSocket } from "../context/SocketContext"
import { useAuth } from "../context/AuthContext"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import TypingIndicator from "./TypingIndicator"

const ChatWindow = ({ currentRoom, selectedRoom }) => {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { messages, sendMessage, startTyping, stopTyping, typingUsers, uploadFile } = useSocket()
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && selectedRoom) {
      sendMessage(message, selectedRoom)
      setMessage("")
      handleStopTyping()
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      startTyping(selectedRoom)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping(selectedRoom)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleFileUpload = (file) => {
    if (file && selectedRoom) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadFile(e.target.result, file.name, file.type, selectedRoom)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">Welcome to Chat!</h2>
          <p>Select a room to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800"># {selectedRoom}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} currentUser={user} />
        <TypingIndicator typingUsers={typingUsers} currentUser={user} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          message={message}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
          onFileUpload={handleFileUpload}
          onStopTyping={handleStopTyping}
        />
      </div>
    </div>
  )
}

export default ChatWindow
