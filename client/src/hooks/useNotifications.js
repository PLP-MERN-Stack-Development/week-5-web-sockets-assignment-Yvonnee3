"use client"

import { useState, useEffect, useCallback } from "react"

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission)
  const [isSupported, setIsSupported] = useState("Notification" in window)

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }, [isSupported])

  // Show browser notification
  const showNotification = useCallback(
    (title, options = {}) => {
      if (!isSupported || permission !== "granted") return null

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "chat-notification",
          renotify: true,
          ...options,
        })

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)

        return notification
      } catch (error) {
        console.error("Error showing notification:", error)
        return null
      }
    },
    [isSupported, permission],
  )

  // Play notification sound
  const playNotificationSound = useCallback((soundType = "message") => {
    try {
      const audio = new Audio(`/sounds/${soundType}.mp3`)
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore errors (user interaction required)
      })
    } catch (error) {
      console.log("Could not play notification sound")
    }
  }, [])

  // Show message notification
  const showMessageNotification = useCallback(
    (sender, message, options = {}) => {
      const notification = showNotification(`New message from ${sender}`, {
        body: message,
        ...options,
      })

      playNotificationSound("message")
      return notification
    },
    [showNotification, playNotificationSound],
  )

  // Show user status notification
  const showUserStatusNotification = useCallback(
    (username, status) => {
      const messages = {
        online: `${username} is now online`,
        offline: `${username} went offline`,
        joined: `${username} joined the chat`,
        left: `${username} left the chat`,
      }

      return showNotification("User Status", {
        body: messages[status] || `${username} ${status}`,
        tag: "user-status",
      })
    },
    [showNotification],
  )

  // Initialize notifications
  useEffect(() => {
    if (isSupported && permission === "default") {
      // Don't auto-request, let user trigger it
    }
  }, [isSupported, permission])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showMessageNotification,
    showUserStatusNotification,
    playNotificationSound,
  }
}
