import io from "socket.io-client"

class SocketClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.eventListeners = new Map()
  }

  // Initialize socket connection
  connect(token, options = {}) {
    const defaultOptions = {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      maxHttpBufferSize: 1e8,
      pingTimeout: 60000,
      pingInterval: 25000,
    }

    const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000"

    this.socket = io(serverUrl, {
      ...defaultOptions,
      ...options,
      auth: { token },
    })

    this.setupEventListeners()
    return this.socket
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      this.emit("connection_status", { connected: true })
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      this.isConnected = false
      this.emit("connection_status", { connected: false, reason })
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.reconnectAttempts++
      this.emit("connection_error", { error, attempts: this.reconnectAttempts })
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
      this.isConnected = true
      this.reconnectAttempts = 0
      this.emit("reconnected", { attempts: attemptNumber })
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error)
      this.emit("reconnect_error", { error })
    })

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed")
      this.emit("reconnect_failed")
    })
  }

  // Add event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)

    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }

    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn("Socket not connected, cannot emit:", event)
    }
  }

  // Emit with acknowledgment
  emitWithAck(event, data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket not connected"))
        return
      }

      const timer = setTimeout(() => {
        reject(new Error("Socket timeout"))
      }, timeout)

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer)
        resolve(response)
      })
    })
  }

  // Join room
  joinRoom(roomId) {
    this.emit("join_room", roomId)
  }

  // Leave room
  leaveRoom(roomId) {
    this.emit("leave_room", roomId)
  }

  // Send message
  sendMessage(messageData) {
    this.emit("send_message", messageData)
  }

  // Send private message
  sendPrivateMessage(messageData) {
    this.emit("send_private_message", messageData)
  }

  // Start typing
  startTyping(roomId) {
    this.emit("typing_start", { roomId })
  }

  // Stop typing
  stopTyping(roomId) {
    this.emit("typing_stop", { roomId })
  }

  // Add reaction
  addReaction(messageId, reaction) {
    this.emit("add_reaction", { messageId, reaction })
  }

  // Upload file
  uploadFile(fileData) {
    this.emit("upload_file", fileData)
  }

  // Mark message as read
  markAsRead(messageId) {
    this.emit("mark_as_read", { messageId })
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    }
  }

  // Manually reconnect
  reconnect() {
    if (this.socket) {
      this.socket.connect()
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient()

export default socketClient;
