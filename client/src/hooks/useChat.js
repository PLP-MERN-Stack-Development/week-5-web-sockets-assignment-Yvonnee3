"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "../context/SocketContext"
import { useAuth } from "../context/AuthContext"

export const useChat = (roomId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const { socket } = useSocket()
  const { user } = useAuth()

  // Load messages for a room
  const loadMessages = useCallback(async (roomId, pageNum = 1) => {
    if (!roomId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/messages/${roomId}?page=${pageNum}&limit=50`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load messages")
      }

      const data = await response.json()

      if (pageNum === 1) {
        setMessages(data.messages)
      } else {
        setMessages((prev) => [...data.messages, ...prev])
      }

      setHasMore(data.pagination.hasNext)
      setPage(pageNum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (!loading && hasMore && roomId) {
      loadMessages(roomId, page + 1)
    }
  }, [loading, hasMore, roomId, page, loadMessages])

  // Send message
  const sendMessage = useCallback(
    (content, messageType = "text") => {
      if (!socket || !roomId || !content.trim()) return

      socket.emit("send_message", {
        content: content.trim(),
        roomId,
        messageType,
      })
    },
    [socket, roomId],
  )

  // Add message to local state (for real-time updates)
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Update message (for reactions, edits, etc.)
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, ...updates } : msg)))
  }, [])

  // Remove message
  const removeMessage = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
  }, [])

  // Search messages
  const searchMessages = useCallback(
    async (query) => {
      if (!query.trim()) return []

      try {
        const response = await fetch(`/api/messages/search?query=${encodeURIComponent(query)}&roomId=${roomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Search failed")
        }

        const data = await response.json()
        return data.messages
      } catch (err) {
        console.error("Search error:", err)
        return []
      }
    },
    [roomId],
  )

  // Load messages when room changes
  useEffect(() => {
    if (roomId) {
      setMessages([])
      setPage(1)
      setHasMore(true)
      loadMessages(roomId, 1)
    }
  }, [roomId, loadMessages])

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    addMessage,
    updateMessage,
    removeMessage,
    loadMoreMessages,
    searchMessages,
    refreshMessages: () => loadMessages(roomId, 1),
  }
}
