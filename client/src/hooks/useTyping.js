"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSocket } from "../context/SocketContext"

export const useTyping = (roomId) => {
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const typingTimeoutRef = useRef(null)
  const { socket } = useSocket()

  // Start typing
  const startTyping = useCallback(() => {
    if (!socket || !roomId || isTyping) return

    setIsTyping(true)
    socket.emit("typing_start", { roomId })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [socket, roomId, isTyping])

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!socket || !roomId || !isTyping) return

    setIsTyping(false)
    socket.emit("typing_stop", { roomId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [socket, roomId, isTyping])

  // Handle input change with typing detection
  const handleInputChange = useCallback(
    (value, onChange) => {
      onChange(value)

      if (value.trim()) {
        startTyping()
      } else {
        stopTyping()
      }
    },
    [startTyping, stopTyping],
  )

  // Listen for typing events
  useEffect(() => {
    if (!socket) return

    const handleUserTyping = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          const filtered = prev.filter((user) => user.userId !== data.userId)
          return [...filtered, data]
        })
      }
    }

    const handleUserStopTyping = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== data.userId))
      }
    }

    socket.on("user_typing", handleUserTyping)
    socket.on("user_stop_typing", handleUserStopTyping)

    return () => {
      socket.off("user_typing", handleUserTyping)
      socket.off("user_stop_typing", handleUserStopTyping)
    }
  }, [socket, roomId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      stopTyping()
    }
  }, [stopTyping])

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping,
    handleInputChange,
  }
}

