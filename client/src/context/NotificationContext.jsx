"use client"

import { createContext, useContext, useState, useEffect } from "react"

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    // Request notification permission on mount
    if (permission === "default") {
      Notification.requestPermission().then(setPermission)
    }
  }, [permission])

  const showNotification = (message, type = "info", options = {}) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      ...options,
    }

    setNotifications((prev) => [...prev, notification])

    // Show browser notification if permission granted
    if (permission === "granted" && type === "message") {
      new Notification("New Message", {
        body: message,
        icon: "/favicon.ico",
        tag: "chat-message",
      })
    }

    // Auto remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)

    // Play sound for message notifications
    if (type === "message") {
      playNotificationSound()
    }
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.log("Could not play notification sound")
    }
  }

  const value = {
    notifications,
    showNotification,
    removeNotification,
    permission,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : notification.type === "message"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm">{notification.message}</p>
            <button onClick={() => onRemove(notification.id)} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
