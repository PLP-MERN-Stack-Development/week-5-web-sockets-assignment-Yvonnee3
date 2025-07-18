// Main socket exports
export { default as socketClient } from "./socketClient"
export { default as socketManager } from "./socketManager"
export {
  SOCKET_EVENTS,
  createSocketEventHandlers,
  registerSocketEvents,
  unregisterSocketEvents,
} from "./socketEvents"

// Re-export for convenience
export { default } from "./socketManager"
