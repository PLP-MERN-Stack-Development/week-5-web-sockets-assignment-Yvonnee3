// Socket event constants
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",

  // Authentication events
  AUTHENTICATE: "authenticate",
  AUTHENTICATED: "authenticated",
  AUTHENTICATION_ERROR: "authentication_error",

  // User events
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  ONLINE_USERS: "online_users",
  USER_JOINED_ROOM: "user_joined_room",
  USER_LEFT_ROOM: "user_left_room",

  // Room events
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ROOM_MESSAGES: "room_messages",

  // Message events
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  MESSAGE_SENT: "message_sent",
  MESSAGE_ERROR: "message_error",

  // Private message events
  SEND_PRIVATE_MESSAGE: "send_private_message",
  PRIVATE_MESSAGE: "private_message",
  PRIVATE_MESSAGE_SENT: "private_message_sent",

  // Typing events
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",

  // Reaction events
  ADD_REACTION: "add_reaction",
  MESSAGE_REACTION: "message_reaction",

  // File events
  UPLOAD_FILE: "upload_file",
  FILE_UPLOADED: "file_uploaded",
  FILE_ERROR: "file_error",

  // Read receipt events
  MARK_AS_READ: "mark_as_read",
  MESSAGE_READ: "message_read",

  // Error events
  ERROR: "error",
  VALIDATION_ERROR: "validation_error",
}

// Socket event handlers factory
export const createSocketEventHandlers = (callbacks = {}) => {
  return {
    // Connection handlers
    [SOCKET_EVENTS.CONNECT]: () => {
      console.log("Connected to server")
      callbacks.onConnect?.()
    },

    [SOCKET_EVENTS.DISCONNECT]: (reason) => {
      console.log("Disconnected from server:", reason)
      callbacks.onDisconnect?.(reason)
    },

    [SOCKET_EVENTS.CONNECT_ERROR]: (error) => {
      console.error("Connection error:", error)
      callbacks.onConnectionError?.(error)
    },

    [SOCKET_EVENTS.RECONNECT]: (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts")
      callbacks.onReconnect?.(attemptNumber)
    },

    // Authentication handlers
    [SOCKET_EVENTS.AUTHENTICATED]: (data) => {
      console.log("Authenticated:", data.user)
      callbacks.onAuthenticated?.(data)
    },

    [SOCKET_EVENTS.AUTHENTICATION_ERROR]: (error) => {
      console.error("Authentication error:", error)
      callbacks.onAuthenticationError?.(error)
    },

    // User handlers
    [SOCKET_EVENTS.ONLINE_USERS]: (users) => {
      callbacks.onOnlineUsers?.(users)
    },

    [SOCKET_EVENTS.USER_ONLINE]: (userData) => {
      callbacks.onUserOnline?.(userData)
    },

    [SOCKET_EVENTS.USER_OFFLINE]: (data) => {
      callbacks.onUserOffline?.(data)
    },

    // Room handlers
    [SOCKET_EVENTS.ROOM_MESSAGES]: (messages) => {
      callbacks.onRoomMessages?.(messages)
    },

    [SOCKET_EVENTS.USER_JOINED_ROOM]: (data) => {
      callbacks.onUserJoinedRoom?.(data)
    },

    [SOCKET_EVENTS.USER_LEFT_ROOM]: (data) => {
      callbacks.onUserLeftRoom?.(data)
    },

    // Message handlers
    [SOCKET_EVENTS.NEW_MESSAGE]: (message) => {
      callbacks.onNewMessage?.(message)
    },

    [SOCKET_EVENTS.PRIVATE_MESSAGE]: (message) => {
      callbacks.onPrivateMessage?.(message)
    },

    [SOCKET_EVENTS.PRIVATE_MESSAGE_SENT]: (message) => {
      callbacks.onPrivateMessageSent?.(message)
    },

    // Typing handlers
    [SOCKET_EVENTS.USER_TYPING]: (data) => {
      callbacks.onUserTyping?.(data)
    },

    [SOCKET_EVENTS.USER_STOP_TYPING]: (data) => {
      callbacks.onUserStopTyping?.(data)
    },

    // Reaction handlers
    [SOCKET_EVENTS.MESSAGE_REACTION]: (data) => {
      callbacks.onMessageReaction?.(data)
    },

    // File handlers
    [SOCKET_EVENTS.FILE_UPLOADED]: (data) => {
      callbacks.onFileUploaded?.(data)
    },

    [SOCKET_EVENTS.FILE_ERROR]: (error) => {
      callbacks.onFileError?.(error)
    },

    // Read receipt handlers
    [SOCKET_EVENTS.MESSAGE_READ]: (data) => {
      callbacks.onMessageRead?.(data)
    },

    // Error handlers
    [SOCKET_EVENTS.ERROR]: (error) => {
      console.error("Socket error:", error)
      callbacks.onError?.(error)
    },

    [SOCKET_EVENTS.VALIDATION_ERROR]: (error) => {
      console.error("Validation error:", error)
      callbacks.onValidationError?.(error)
    },
  }
}

// Helper function to register event handlers
export const registerSocketEvents = (socket, handlers) => {
  Object.entries(handlers).forEach(([event, handler]) => {
    socket.on(event, handler)
  })
}

// Helper function to unregister event handlers
export const unregisterSocketEvents = (socket, handlers) => {
  Object.entries(handlers).forEach(([event, handler]) => {
    socket.off(event, handler)
  })
}
