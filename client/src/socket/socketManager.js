import socketClient from "./socketClient"
import { SOCKET_EVENTS, createSocketEventHandlers, registerSocketEvents, unregisterSocketEvents } from "./socketEvents"

class SocketManager {
  constructor() {
    this.socket = null
    this.isInitialized = false
    this.eventHandlers = {}
    this.callbacks = {}
  }

  // Initialize socket connection
  initialize(token, callbacks = {}) {
    if (this.isInitialized) {
      console.warn("Socket already initialized")
      return this.socket
    }

    this.callbacks = callbacks
    this.socket = socketClient.connect(token)
    this.eventHandlers = createSocketEventHandlers(callbacks)

    // Register event handlers
    registerSocketEvents(this.socket, this.eventHandlers)

    this.isInitialized = true
    return this.socket
  }

  // Update callbacks
  updateCallbacks(newCallbacks) {
    this.callbacks = { ...this.callbacks, ...newCallbacks }

    if (this.socket && this.isInitialized) {
      // Unregister old handlers
      unregisterSocketEvents(this.socket, this.eventHandlers)

      // Create new handlers with updated callbacks
      this.eventHandlers = createSocketEventHandlers(this.callbacks)

      // Register new handlers
      registerSocketEvents(this.socket, this.eventHandlers)
    }
  }

  // Authenticate user
  authenticate(token) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.AUTHENTICATE, token)
    }
  }

  // Join room
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId)
    }
  }

  // Leave room
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId)
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, messageData)
    }
  }

  // Send private message
  sendPrivateMessage(messageData) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.SEND_PRIVATE_MESSAGE, messageData)
    }
  }

  // Start typing
  startTyping(roomId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.TYPING_START, { roomId })
    }
  }

  // Stop typing
  stopTyping(roomId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.TYPING_STOP, { roomId })
    }
  }

  // Add reaction
  addReaction(messageId, reaction) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.ADD_REACTION, { messageId, reaction })
    }
  }

  // Upload file
  uploadFile(fileData) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.UPLOAD_FILE, fileData)
    }
  }

  // Mark message as read
  markAsRead(messageId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.MARK_AS_READ, { messageId })
    }
  }

  // Get connection status
  getConnectionStatus() {
    return socketClient.getConnectionStatus()
  }

  // Manually reconnect
  reconnect() {
    socketClient.reconnect()
  }

  // Disconnect
  disconnect() {
    if (this.socket && this.isInitialized) {
      unregisterSocketEvents(this.socket, this.eventHandlers)
      socketClient.disconnect()
      this.socket = null
      this.isInitialized = false
      this.eventHandlers = {}
    }
  }

  // Add custom event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Remove custom event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager()

export default socketManager
