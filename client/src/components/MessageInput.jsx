"use client"

import { useRef } from "react"

const MessageInput = ({ message, onChange, onSubmit, onFileUpload, onStopTyping }) => {
  const fileInputRef = useRef(null)

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileUpload(file)
    }
    e.target.value = "" // Reset file input
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end space-x-2">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          onBlur={onStopTyping}
          placeholder="Type a message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="1"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        📎
      </button>

      <button
        type="submit"
        disabled={!message.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </form>
  )
}

export default MessageInput
